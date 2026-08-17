using Asp.Versioning;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.Data.SqlClient;
using Microsoft.OpenApi.Models;
using Pharmacy.API.Hubs;
using Pharmacy.Application.Interfaces;
using Pharmacy.Application.Services;
using Pharmacy.Infrastructure.Repositories;
using PharmacyApplication.Services;
using PharmacyDomain.Interfaces;
using PharmacyInfrastructure.Repositories;
using Serilog;
using System.Data;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// ============================================================
// SERILOG
// ============================================================

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .WriteTo.Console()
    .CreateLogger();

builder.Host.UseSerilog();


// ============================================================
// JWT SETTINGS
// ============================================================

var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"];


// ============================================================
// API VERSIONING
// ============================================================

builder.Services
    .AddApiVersioning(options =>
    {
        options.DefaultApiVersion = new ApiVersion(1, 0);

        options.AssumeDefaultVersionWhenUnspecified = true;

        options.ReportApiVersions = true;

        options.ApiVersionReader = new UrlSegmentApiVersionReader();
    })
    .AddApiExplorer(options =>
    {
        options.GroupNameFormat = "'v'VVV";

        options.SubstituteApiVersionInUrl = true;
    });


// ============================================================
// AUTHENTICATION
// ============================================================
//
// IMPORTANT:
//
// Cookie authentication is the main authentication scheme.
//
// Google/GitHub are external login providers.
//
// API requests must NOT be redirected to Google when the user
// is unauthenticated. Instead, API requests receive 401/403.
//
// This prevents:
//
// React
//   ↓
// /api/v1/Customer
//   ↓
// Google OAuth
//   ↓
// CORS / 403
//
// ============================================================

builder.Services
    .AddAuthentication(options =>
    {
        // Main authentication scheme
        options.DefaultAuthenticateScheme =
            CookieAuthenticationDefaults.AuthenticationScheme;

        // Main sign-in scheme
        options.DefaultSignInScheme =
            CookieAuthenticationDefaults.AuthenticationScheme;

        // IMPORTANT:
        // Do NOT make Google the default challenge scheme.
        //
        // Otherwise an unauthenticated API request can be
        // redirected to Google.
        options.DefaultChallengeScheme =
            CookieAuthenticationDefaults.AuthenticationScheme;
    })

    // ========================================================
    // COOKIE AUTHENTICATION
    // ========================================================

    .AddCookie(CookieAuthenticationDefaults.AuthenticationScheme, options =>
    {
        options.LoginPath = "/Login";

        options.LogoutPath = "/Logout";

        options.AccessDeniedPath = "/AccessDenied";

        options.ExpireTimeSpan = TimeSpan.FromMinutes(60);

        options.SlidingExpiration = true;

        options.Cookie.HttpOnly = true;

        options.Cookie.SecurePolicy =
            CookieSecurePolicy.Always;

        // React (localhost:5173)
        // API   (localhost:7232)
        //
        // Therefore the cookie needs to work cross-origin.
        options.Cookie.SameSite = SameSiteMode.None;


        // ====================================================
        // IMPORTANT API AUTHENTICATION FIX
        // ====================================================
        //
        // Normal browser pages:
        //
        //     redirect to /Login
        //
        // API requests:
        //
        //     return 401
        //
        // This prevents Axios from being redirected to Google.
        // ====================================================

        options.Events.OnRedirectToLogin = context =>
        {
            if (context.Request.Path.StartsWithSegments("/api"))
            {
                context.Response.StatusCode =
                    StatusCodes.Status401Unauthorized;

                return Task.CompletedTask;
            }

            context.Response.Redirect(context.RedirectUri);

            return Task.CompletedTask;
        };


        // ====================================================
        // API 403 FIX
        // ====================================================

        options.Events.OnRedirectToAccessDenied = context =>
        {
            if (context.Request.Path.StartsWithSegments("/api"))
            {
                context.Response.StatusCode =
                    StatusCodes.Status403Forbidden;

                return Task.CompletedTask;
            }

            context.Response.Redirect(context.RedirectUri);

            return Task.CompletedTask;
        };
    })

    // ========================================================
    // GOOGLE
    // ========================================================

    .AddGoogle(GoogleDefaults.AuthenticationScheme, options =>
    {
        options.ClientId =
            builder.Configuration["Authentication:Google:ClientId"]!;

        options.ClientSecret =
            builder.Configuration["Authentication:Google:ClientSecret"]!;

        options.SignInScheme =
            CookieAuthenticationDefaults.AuthenticationScheme;

        options.SaveTokens = false;
    })

    // ========================================================
    // GITHUB
    // ========================================================

    .AddGitHub(options =>
    {
        options.ClientId =
            "Ov23liLTP8vHAjEeNljq";

        options.ClientSecret =
            "ca3148946f965e8017be3fcf03605de8a7da68c8";

        options.Scope.Add("user:email");

        options.SignInScheme =
            CookieAuthenticationDefaults.AuthenticationScheme;

        options.SaveTokens = false;
    });


// ============================================================
// AUTHORIZATION
// ============================================================

builder.Services.AddAuthorization();


// ============================================================
// CONTROLLERS
// ============================================================

builder.Services.AddControllers();


// ============================================================
// APPLICATION SERVICES
// ============================================================

builder.Services.AddScoped<EmailService>();

builder.Services.AddScoped<PaymentService>();

builder.Services.AddSignalR();


// ============================================================
// SWAGGER
// ============================================================

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Pharmacy API",
        Version = "v1"
    });


    // --------------------------------------------------------
    // JWT / BEARER
    // --------------------------------------------------------

    options.AddSecurityDefinition("Bearer",
        new OpenApiSecurityScheme
        {
            Name = "Authorization",

            Type = SecuritySchemeType.Http,

            Scheme = "Bearer",

            In = ParameterLocation.Header,

            Description =
                "Enter your JWT token."
        });


    // --------------------------------------------------------
    // API KEY
    // --------------------------------------------------------

    options.AddSecurityDefinition("ApiKey",
        new OpenApiSecurityScheme
        {
            Name = "X-Api-Key",

            Type = SecuritySchemeType.ApiKey,

            In = ParameterLocation.Header,

            Description =
                "Enter your API key."
        });


    // --------------------------------------------------------
    // SECURITY REQUIREMENT
    // --------------------------------------------------------

    options.AddSecurityRequirement(
        new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference =
                        new OpenApiReference
                        {
                            Type =
                                ReferenceType.SecurityScheme,

                            Id = "Bearer"
                        }
                },

                Array.Empty<string>()
            },

            {
                new OpenApiSecurityScheme
                {
                    Reference =
                        new OpenApiReference
                        {
                            Type =
                                ReferenceType.SecurityScheme,

                            Id = "ApiKey"
                        }
                },

                Array.Empty<string>()
            }
        });
});


// ============================================================
// DATABASE
// ============================================================

builder.Services.AddScoped<IDbConnection>(_ =>
    new SqlConnection(
        builder.Configuration
            .GetConnectionString("DefaultConnection")
    ));


// ============================================================
// REPOSITORIES
// ============================================================

builder.Services.AddScoped<ICustomerRepository, CustomerRepository>();

builder.Services.AddScoped<IMedicineRepository, MedicineRepository>();

builder.Services.AddScoped<ISupplierRepository, SupplierRepository>();

builder.Services.AddScoped<ISaleRepository, SaleRepository>();

builder.Services.AddScoped<IStockRepository, StockRepository>();

builder.Services.AddScoped<IDashboardRepository, DashboardRepository>();

builder.Services.AddScoped<IPurchaseRepository, PurchaseRepository>();

builder.Services.AddScoped<IPharmacyRepository, PharmacyRepository>();

builder.Services.AddScoped<IUserRepository, UserRepository>();


// ============================================================
// SERVICES
// ============================================================

builder.Services.AddScoped<TokenService>();

builder.Services.AddScoped<PharmacyService>();

builder.Services.AddScoped<UserService>();


// ============================================================
// RATE LIMITING
// ============================================================

builder.Services.AddRateLimiter(options =>
{
    options.AddPolicy(
        "login",
        httpContext =>
            RateLimitPartition.GetFixedWindowLimiter(
                partitionKey:
                    httpContext.Connection
                        .RemoteIpAddress?
                        .ToString()
                    ?? "unknown",

                factory: _ =>
                    new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = 5,

                        Window =
                            TimeSpan.FromMinutes(1),

                        QueueLimit = 0
                    }));


    options.OnRejected = async (context, cancellationToken) =>
    {
        context.HttpContext.Response.StatusCode =
            StatusCodes.Status429TooManyRequests;

        context.HttpContext.Response.Headers.RetryAfter =
            "60";

        await context.HttpContext.Response.WriteAsync(
            "Too many login attempts. Please try again later.",
            cancellationToken);
    };
});


// ============================================================
// CORS
// ============================================================
//
// React:
// http://localhost:5173
//
// API:
// https://localhost:7232
//
// Because the authentication cookie is being sent from React,
// AllowCredentials() is required.
//
// ============================================================

builder.Services.AddCors(options =>
{
    options.AddPolicy("DevPolicy", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")

            .AllowAnyHeader()

            .AllowAnyMethod()

            .AllowCredentials();
    });
});


// ============================================================
// BUILD APPLICATION
// ============================================================

var app = builder.Build();


// ============================================================
// SWAGGER
// ============================================================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();

    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint(
            "/swagger/v1/swagger.json",
            "Pharmacy API V1");
    });
}


// ============================================================
// HTTP PIPELINE
// ============================================================

app.UseHttpsRedirection();


// IMPORTANT:
// CORS must run before authentication/authorization.
app.UseCors("DevPolicy");


// IMPORTANT:
// Authentication must run before authorization.
app.UseAuthentication();


// Rate limiter
app.UseRateLimiter();


// Authorization
app.UseAuthorization();


// ============================================================
// CONTROLLERS
// ============================================================

app.MapControllers();


// ============================================================
// SIGNALR HUBS
// ============================================================

app.MapHub<NotificationHub>(
    "/notificationHub");

app.MapHub<ChatHub>(
    "/chatHub");


// ============================================================
// RUN
// ============================================================

app.Run();