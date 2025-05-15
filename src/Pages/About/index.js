import React, { useState, useEffect } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { toast } from "react-toastify";
import { api } from "./path/to/api"; // Đường dẫn đến file api.js của bạn

const About = () => {
  const [contactInfo, setContactInfo] = useState({
    address: "",
    location: "",
    phone: "",
    phoneNote: "",
    email: "",
    emailNote: "",
  });

  const [feedback, setFeedback] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  // Lấy thông tin liên hệ
  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await api.get("/about/contact-info");
        setContactInfo(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin liên hệ:", error);
      }
    };

    fetchContactInfo();
  }, []);

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFeedback((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Xử lý gửi form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/about/feedback", feedback);
      toast.success("Gửi tin nhắn thành công!");
      // Reset form
      setFeedback({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      toast.error("Có lỗi xảy ra khi gửi tin nhắn!");
      console.error("Lỗi khi gửi tin nhắn:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Get In Touch Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Liên Hệ Với Chúng Tôi
        </h1>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ với chúng
          tôi nếu bạn có bất kỳ câu hỏi hoặc yêu cầu nào.
        </p>
      </div>

      {/* Contact Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {/* Address Card */}
        <div className="bg-gray-100 p-8 rounded-lg flex flex-col items-center text-center">
          <div
            className="p-3 rounded-full mb-4"
            style={{ backgroundColor: "#00aaff" }}
          >
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <h3 className="font-medium mb-2" style={{ color: "#00aaff" }}>
            {contactInfo.address}
          </h3>
          <p className="text-gray-500">{contactInfo.location}</p>
        </div>

        {/* Phone Card */}
        <div className="bg-gray-100 p-8 rounded-lg flex flex-col items-center text-center">
          <div
            className="p-3 rounded-full mb-4"
            style={{ backgroundColor: "#00aaff" }}
          >
            <Phone className="h-6 w-6 text-white" />
          </div>
          <h3 className="font-medium mb-2" style={{ color: "#00aaff" }}>
            {contactInfo.phone}
          </h3>
          <p className="text-gray-500">{contactInfo.phoneNote}</p>
        </div>

        {/* Email Card */}
        <div className="bg-gray-100 p-8 rounded-lg flex flex-col items-center text-center">
          <div
            className="p-3 rounded-full mb-4"
            style={{ backgroundColor: "#00aaff" }}
          >
            <Mail className="h-6 w-6 text-white" />
          </div>
          <h3 className="font-medium mb-2" style={{ color: "#00aaff" }}>
            {contactInfo.email}
          </h3>
          <p className="text-gray-500">{contactInfo.emailNote}</p>
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Gửi Tin Nhắn
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Điền thông tin vào form bên dưới và chúng tôi sẽ liên hệ lại với bạn
            trong thời gian sớm nhất.
          </p>
        </div>

        <form className="max-w-4xl mx-auto" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Name Field */}
            <div>
              <label className="block text-gray-700 mb-2">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={feedback.name}
                onChange={handleChange}
                className="w-full p-3 bg-gray-100 rounded-md"
                required
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={feedback.email}
                onChange={handleChange}
                className="w-full p-3 bg-gray-100 rounded-md"
                required
              />
            </div>
          </div>

          {/* Subject Field */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="subject"
              value={feedback.subject}
              onChange={handleChange}
              className="w-full p-3 bg-gray-100 rounded-md"
              required
            />
          </div>

          {/* Message Field */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">
              Nội dung tin nhắn <span className="text-red-500">*</span>
            </label>
            <textarea
              name="message"
              value={feedback.message}
              onChange={handleChange}
              className="w-full p-3 bg-gray-100 rounded-md h-32"
              required
            ></textarea>
          </div>

          {/* Submit Button */}
          <div className="text-left">
            <button
              type="submit"
              disabled={loading}
              className={`text-white py-3 px-8 rounded-md font-medium transition-colors ${
                loading ? "bg-gray-400 cursor-not-allowed" : "hover:bg-blue-900"
              }`}
              style={{ backgroundColor: loading ? "#ccc" : "#00aaff" }}
            >
              {loading ? "Đang gửi..." : "Gửi Tin Nhắn"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default About;
