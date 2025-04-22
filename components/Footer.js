import { FiGithub, FiTwitter, FiLinkedin, FiInfo, FiHelpCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function Footer({ darkMode }) {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className={`mt-12 py-8 border-t ${
        darkMode ? 'bg-gray-900 text-gray-300 border-gray-800' : 'bg-white text-gray-600 border-gray-200'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-6 md:mb-0">
            <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              CryptoTracker Pro
            </h3>
            <p className="mt-2 text-sm max-w-xs">
              Track cryptocurrency prices, get market insights, and make better trading decisions.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-medium mb-2">Resources</h4>
              <ul className="text-sm space-y-2">
                <li><a href="#" className="hover:text-purple-500 transition-colors">Market Analysis</a></li>
                <li><a href="#" className="hover:text-purple-500 transition-colors">Trading Guide</a></li>
                <li><a href="#" className="hover:text-purple-500 transition-colors">API Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Company</h4>
              <ul className="text-sm space-y-2">
                <li><a href="#" className="hover:text-purple-500 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-purple-500 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-purple-500 transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Legal</h4>
              <ul className="text-sm space-y-2">
                <li><a href="#" className="hover:text-purple-500 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-purple-500 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-purple-500 transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t flex flex-col sm:flex-row justify-between items-center text-sm">
          <p>© {new Date().getFullYear()} CryptoTracker Pro. All rights reserved.</p>
          
          <div className="flex mt-4 sm:mt-0 space-x-4">
            <motion.a 
              href="#" 
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className="hover:text-purple-500 transition-colors"
              aria-label="GitHub"
            >
              <FiGithub size={20} />
            </motion.a>
            <motion.a 
              href="#" 
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className="hover:text-purple-500 transition-colors"
              aria-label="Twitter"
            >
              <FiTwitter size={20} />
            </motion.a>
            <motion.a 
              href="#" 
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className="hover:text-purple-500 transition-colors"
              aria-label="LinkedIn"
            >
              <FiLinkedin size={20} />
            </motion.a>
            <motion.a 
              href="#" 
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className="hover:text-purple-500 transition-colors"
              aria-label="Help"
            >
              <FiHelpCircle size={20} />
            </motion.a>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
