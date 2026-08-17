import React, { useState } from "react";
import { Mail, User, MessageSquare, Send } from "lucide-react";
import axios from "axios";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 mb in bytes

const Email = () => {
  const [form, setForm] = useState({
    to: "",
    subject: "",
    body: "",
  });
  // const [attachment, setAttachment] = useState(null);
  const [attachments, setAttachments] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSend = async () => {
    try {
      // File size check
      // const hasLargeFile = attachments.some(
      //   (file) => file.size > MAX_FILE_SIZE,
      // );

      // if (hasLargeFile) {
      //   alert("Each file should be less than 10 MB");
      //   return;
      // }

      const formData = new FormData();

      formData.append("to", form.to);
      formData.append("subject", form.subject);
      formData.append("body", form.body);
      // formData.append("attachment", attachment); // check first if attachment is there
      attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      const response = await axios.post(
        "https://localhost:7232/api/Dashboard/email",
        formData,
        { withCredentials: true },
      );

      window.alert(response.data);

      // setForm({
      //   to: "",
      //   subject: "",
      //   body: "",
      // });
    } catch (err) {
      console.error("Failed to send email: ", err.message);
    }
  };

  return (
    <div>
      <div className="p-8 w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">Send Email</h1>
          <p className="text-sm text-gray-500 mt-1">
            Compose a new email message
          </p>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <Mail
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="email"
              name="to"
              placeholder="Recipient email"
              value={form.to}
              onChange={handleInputChange}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-800 placeholder-gray-400"
            />
          </div>

          <div className="relative">
            <User
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              name="subject"
              placeholder="Subject"
              value={form.subject}
              onChange={handleInputChange}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-800 placeholder-gray-400"
            />
          </div>

          <div className="relative">
            <MessageSquare
              size={15}
              className="absolute left-3 top-3 text-gray-400"
            />
            <textarea
              name="body"
              placeholder="Message"
              value={form.body}
              onChange={handleInputChange}
              rows={4}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-800 placeholder-gray-400 resize-none"
            />
          </div>
        </div>

        {/* <input type="file" onChange={(e) => setAttachment(e.target.files[0])} /> */}

        <input
          type="file"
          multiple
          onChange={(e) => setAttachments(Array.from(e.target.files))}
        />

        <p className="text-amber-700 text-sm mt-2 italic">
          Upload size limited to 10 mb for each file
        </p>

        <button
          onClick={handleSend}
          className="mt-5 w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-300 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
        >
          <Send size={15} />
          Send Email
        </button>
      </div>
    </div>
  );
};

export default Email;
