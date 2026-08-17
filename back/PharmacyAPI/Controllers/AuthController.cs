using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Pharmacy.Application.Interfaces;
using Pharmacy.Application.Services;
using System.Reflection;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.Google;

namespace Pharmacy.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly TokenService _tokenService;
        private readonly UserService _userService;
        public record Req(string Email, string Password);
        public AuthController(TokenService tokenService, UserService userService)
        {
            _tokenService = tokenService;
            _userService = userService;
        }

        //[HttpPost("login")]
        //[EnableRateLimiting("login")]
        //public async Task<IActionResult> Login([FromBody] Req request)
        //{
        //    try
        //    {
        //        var user = await _userService.GetByEmail(request.Email);

        //        if (user is null)
        //            return Unauthorized(new { message = "Invalid credentials" });

        //        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
        //            return Unauthorized(new { message = "Invalid credentials" });

        //        var roles = await _userService.GetUserRoles(user.Id);

        //        var accessToken = _tokenService.GenerateToken(
        //            user.Id.ToString(),
        //            user.Email,
        //            roles
        //        );

        //        var refreshToken = _tokenService.GenerateRefreshToken();

        //        await _userService.SaveRefreshToken(
        //            user.Id,
        //            refreshToken,
        //            DateTime.UtcNow.AddDays(7)
        //        );

        //        return Ok(new
        //        {
        //            accessToken,
        //            refreshToken
        //        });
        //    }
        //    catch(Exception ex)
        //    {
        //        return StatusCode(500, new
        //        {
        //            error = ex.Message
        //        });
        //    }
        //}

        [HttpPost("login")]
        [EnableRateLimiting("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                var user = await _userService.GetByEmail(request.Email);

                if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
                    return Unauthorized(new { message = "Invalid credentials" });

                var roles = await _userService.GetUserRoles(user.Id);

                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Email, user.Email)
                };

                foreach (var role in roles)
                    claims.Add(new Claim(ClaimTypes.Role, role));

                var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
                var principal = new ClaimsPrincipal(identity);

                var authProperties = new AuthenticationProperties
                {
                    ExpiresUtc = DateTimeOffset.UtcNow.AddHours(1),
                    IsPersistent = true
                };

                await HttpContext.SignInAsync(
                    CookieAuthenticationDefaults.AuthenticationScheme,
                    principal,
                    authProperties
                );

                return Ok(new { message = "Login successful" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] Req request)
        {
            try
            {
                var exists = await _userService.EmailExists(request.Email);
                if (exists)
                    return Conflict(new { message = "Email is already registered" });

                var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

                var userId = await _userService.Register(request.Email, hashedPassword);

                await _userService.AssignRole(userId, "User"); // role pre-assigned

                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                    new Claim(ClaimTypes.Email, request.Email),
                    new Claim(ClaimTypes.Name, request.Email),
                    new Claim(ClaimTypes.Role, "User")
                };

                var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
                var principal = new ClaimsPrincipal(identity);

                await HttpContext.SignInAsync(
                    CookieAuthenticationDefaults.AuthenticationScheme,
                    principal,
                    new AuthenticationProperties
                    {
                        ExpiresUtc = DateTimeOffset.UtcNow.AddHours(1)
                    }
                );

                return Ok(new { message = "Registered successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An unexpected error occurred" });
            }
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Ok(new { message = "Logged out" });
        }

        //[HttpPost("register")]
        //public async Task<IActionResult> Register([FromBody] Req request)
        //{
        //    try
        //    {
        //        var exists = await _userService.EmailExists(request.Email);

        //        if (exists)
        //            return Conflict(new { message = "Email is already registered" });

        //        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

        //        var userId = await _userService.Register(request.Email, hashedPassword);

        //        await _userService.AssignRole(userId, "User"); // Only 1 role is inserted [What about adding this in Register fn?]

        //        var roles = await _userService.GetUserRoles(userId); // Just pass if user submits the role. No db fetch

        //        var accessToken = _tokenService.GenerateToken(
        //            userId.ToString(),
        //            request.Email,
        //            roles
        //        );

        //        var refreshToken = _tokenService.GenerateRefreshToken();

        //        await _userService.SaveRefreshToken(
        //            userId,
        //            refreshToken,
        //            DateTime.UtcNow.AddDays(7)
        //        );

        //        return Ok(new
        //        {
        //            accessToken,
        //            refreshToken
        //        });
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, new
        //        {
        //            error = ex.Message
        //        });
        //    }
        //}

        //[HttpPost("refresh")]
        //public async Task<IActionResult> Refresh([FromBody] string request)
        //{
        //    try
        //    {
        //        var savedToken = await _userService.GetRefreshToken(request);

        //        if (savedToken is null || !savedToken.IsActive)
        //        {
        //            return Unauthorized(new
        //            {
        //                message = "Invalid or expired refresh token"
        //            });
        //        }

        //        await _userService.RevokeRefreshToken(request);

        //        var user = await _userService.GetById(savedToken.UserId);

        //        if (user is null)
        //        {
        //            return Unauthorized(new
        //            {
        //                message = "User not found"
        //            });
        //        }

        //        var roles = await _userService.GetUserRoles(savedToken.UserId);

        //        var newAccessToken = _tokenService.GenerateToken(
        //            user.Id.ToString(),
        //            user.Email,
        //            roles
        //        );

        //        var newRefreshToken = _tokenService.GenerateRefreshToken();

        //        await _userService.SaveRefreshToken(
        //            user.Id,
        //            newRefreshToken,
        //            DateTime.UtcNow.AddDays(7)
        //        );

        //        return Ok(new
        //        {
        //            accessToken = newAccessToken,
        //            refreshToken = newRefreshToken
        //        });
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, new
        //        {
        //            error = ex.Message,
        //        });
        //    }
        //}

        //[HttpPost("revoke")]
        //[Authorize]
        //public async Task<IActionResult> Revoke([FromBody] string request)
        //{
        //    try
        //    {
        //        await _userService.RevokeRefreshToken(request);
        //        return Ok(new { message = "Token revoked" });
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, new
        //        {
        //            error = ex.Message,
        //        });
        //    }
        //}
        
        [HttpGet("google-login")]
        public IActionResult GoogleLogin()
        {
            var properties = new AuthenticationProperties
            {
                RedirectUri = Url.Action(nameof(GoogleResponse))
            };

            return Challenge(properties, GoogleDefaults.AuthenticationScheme);
        }
        
            [HttpGet("google-response")]
            public async Task<IActionResult> GoogleResponse()
            {
                try
                {
                    var result = await HttpContext.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);

                    if (!result.Succeeded)
                        return Unauthorized();

                    var email = result.Principal?.FindFirst(ClaimTypes.Email)?.Value;

                    if (string.IsNullOrEmpty(email))
                        return Unauthorized();

                    // Find existing user
                    var user = await _userService.GetByEmail(email);

                    if (user == null)
                    {
                        // Register new Google user
                        var userId = await _userService.RegisterGoogleUser(email);

                        await _userService.AssignRole(userId, "User");

                        user = await _userService.GetByEmail(email);
                    }

                    var roles = await _userService.GetUserRoles(user.Id);

                    // Create claims for your application
                    var claims = new List<Claim>
                    {
                        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                        new Claim(ClaimTypes.Email, user.Email)
                    };

                    foreach (var role in roles)
                    {
                        claims.Add(new Claim(ClaimTypes.Role, role));
                    }

                    var identity = new ClaimsIdentity(
                        claims,
                        CookieAuthenticationDefaults.AuthenticationScheme);

                    var principal = new ClaimsPrincipal(identity);

                    var authProperties = new AuthenticationProperties
                    {
                        IsPersistent = true,
                        ExpiresUtc = DateTimeOffset.UtcNow.AddHours(1)
                    };

                    // Sign in using your application's cookie
                    await HttpContext.SignInAsync(
                        CookieAuthenticationDefaults.AuthenticationScheme,
                        principal,
                        authProperties);

                    // Redirect back to React
                    return Redirect("http://localhost:5173/dashboard");
                }
                catch (Exception ex)
                {
                    return StatusCode(500, new
                    {
                        error = ex.Message
                    });
                }
            }
            
            [HttpGet("github-login")]
            public IActionResult GitHubLogin()
            {
                var properties = new AuthenticationProperties
                {
                    RedirectUri = Url.Action(nameof(GitHubResponse))
                };

                return Challenge(properties, "GitHub");
            }
            
            [HttpGet("github-response")]
public async Task<IActionResult> GitHubResponse()
{
    try
    {
        var result = await HttpContext.AuthenticateAsync(
            CookieAuthenticationDefaults.AuthenticationScheme);

        if (!result.Succeeded)
            return Unauthorized();

        var email = result.Principal?.FindFirst(ClaimTypes.Email)?.Value;

        var username = result.Principal?.FindFirst(ClaimTypes.Name)?.Value;

        var githubId = result.Principal?
            .FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(email))
        {
            return BadRequest(new
            {
                error = "GitHub account does not have a verified email address."
            });
        }

        // Find existing user
        var user = await _userService.GetByEmail(email);

        if (user == null)
        {
            // Register new GitHub user
            var userId = await _userService.RegisterGoogleUser(
                email);

            await _userService.AssignRole(userId, "User");

            user = await _userService.GetByEmail(email);
        }

        var roles = await _userService.GetUserRoles(user.Id);

        // Create your application's claims
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, username ?? user.Email)
        };

        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var identity = new ClaimsIdentity(
            claims,
            CookieAuthenticationDefaults.AuthenticationScheme);

        var principal = new ClaimsPrincipal(identity);

        var authProperties = new AuthenticationProperties
        {
            IsPersistent = true,
            ExpiresUtc = DateTimeOffset.UtcNow.AddHours(1)
        };

        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            principal,
            authProperties);

        return Redirect("http://localhost:5173/dashboard");
    }
    catch (Exception ex)
    {
        return StatusCode(500, new
        {
            error = ex.Message
        });
    }
}
    }   
}