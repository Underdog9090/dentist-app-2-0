import React from 'react';
import { FaStar } from 'react-icons/fa';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Patient',
    image: 'https://randomuser.me/api/portraits/women/1.jpg',
    rating: 5,
    text: "The best dental experience I've ever had! The staff was incredibly friendly and professional. My teeth have never looked better.",
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Patient',
    image: 'https://randomuser.me/api/portraits/men/2.jpg',
    rating: 5,
    text: "I was nervous about my dental procedure, but the team made me feel comfortable and at ease. Highly recommended!",
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'Patient',
    image: 'https://randomuser.me/api/portraits/women/3.jpg',
    rating: 5,
    text: "The online booking system is so convenient, and the follow-up care has been exceptional. Great service all around!",
  },
];

const Testimonials = () => {
  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-white">
          What Our Patients Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg shadow-lg transform hover:scale-105 transition duration-300"
            >
              <div className="flex items-center mb-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full mr-4"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {testimonial.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">{testimonial.role}</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <FaStar key={i} className="text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-300 italic">"{testimonial.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials; 