import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">ReWear</h3>
            <p className="text-gray-600 mb-4">
              Sustainable fashion through community swaps. Reduce textile waste and discover new styles.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-gray-600">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C8.396 0 7.996.014 6.79.067 5.59.12 4.663.267 3.865.517c-.806.25-1.49.583-2.178 1.272C.998 2.477.665 3.163.415 3.97c-.25.797-.397 1.724-.45 2.924C-.035 7.996-.05 8.396-.05 12.017s.014 4.02.067 5.226c.053 1.2.2 2.127.45 2.924.25.807.583 1.49 1.272 2.178.688.688 1.372 1.022 2.178 1.272.797.25 1.724.397 2.924.45 1.2.053 1.6.067 5.226.067s4.02-.014 5.226-.067c1.2-.053 2.127-.2 2.924-.45.807-.25 1.49-.583 2.178-1.272.688-.688 1.022-1.372 1.272-2.178.25-.797.397-1.724.45-2.924.053-1.2.067-1.6.067-5.226s-.014-4.02-.067-5.226c-.053-1.2-.2-2.127-.45-2.924-.25-.807-.583-1.49-1.272-2.178C21.522.998 20.838.665 20.03.415c-.797-.25-1.724-.397-2.924-.45C16.02-.035 15.62-.05 12.017-.05zm0 1.93c3.56 0 3.98.014 5.386.077 1.35.063 2.077.28 2.55.466.603.236 1.032.518 1.485.97.453.453.734.882.97 1.485.186.473.403 1.2.466 2.55.063 1.406.077 1.826.077 5.386s-.014 3.98-.077 5.386c-.063 1.35-.28 2.077-.466 2.55-.236.603-.518 1.032-.97 1.485-.453.453-.882.734-1.485.97-.473.186-1.2.403-2.55.466-1.406.063-1.826.077-5.386.077s-3.98-.014-5.386-.077c-1.35-.063-2.077-.28-2.55-.466-.603-.236-1.032-.518-1.485-.97-.453-.453-.734-.882-.97-1.485-.186-.473-.403-1.2-.466-2.55C2.65 8.396 2.636 7.976 2.636 4.417s.014-3.98.077-5.386c.063-1.35.28-2.077.466-2.55.236-.603.518-1.032.97-1.485.453-.453.882-.734 1.485-.97.473-.186 1.2-.403 2.55-.466C8.037 1.944 8.457 1.93 12.017 1.93zm0 7.53a6.54 6.54 0 100 13.08 6.54 6.54 0 000-13.08zm0 10.78a4.24 4.24 0 110-8.48 4.24 4.24 0 010 8.48zm6.77-11.25a1.52 1.52 0 11-3.04 0 1.52 1.52 0 013.04 0z"/>
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/items" className="text-gray-600 hover:text-gray-900">
                  Browse Items
                </Link>
              </li>
              <li>
                <Link to="/add-item" className="text-gray-600 hover:text-gray-900">
                  List an Item
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/swaps" className="text-gray-600 hover:text-gray-900">
                  My Swaps
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-gray-600">
            © 2025 ReWear. All rights reserved. Made with ❤️ for sustainable fashion.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;