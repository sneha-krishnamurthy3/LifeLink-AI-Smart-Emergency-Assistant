import { Link } from 'react-router-dom';
import { Heart, Phone, Mail, MapPin, ExternalLink, Shield, Clock } from 'lucide-react';

const quickLinks = [
  { name: 'Home', path: '/' },
  { name: 'Emergency Guide', path: '/emergency' },
  { name: 'Find Hospitals', path: '/hospitals' },
  { name: 'Blood Donors', path: '/donors' },
  { name: 'SOS Alert', path: '/sos' },
  { name: 'Voice Assistant', path: '/voice' },
  { name: 'About Us', path: '/about' },
];

const emergencyNumbers = [
  { label: 'National Emergency', number: '112', icon: Shield },
  { label: 'Ambulance', number: '108', icon: Clock },
  { label: 'Women Helpline', number: '102', icon: Phone },
];

const Footer = () => {
  return (
    <footer className="bg-[#0F172A] text-slate-300 border-t border-slate-800">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Column 1: Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Heart className="w-7 h-7 text-red-500 fill-red-500" />
              <span className="text-xl font-bold">
                <span className="text-white">LifeLink</span>
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                  AI
                </span>
              </span>
            </Link>
            <p className="text-sm font-medium text-blue-400 mb-3">
              AI-Powered Emergency Response
            </p>
            <p className="text-sm text-slate-400 leading-relaxed">
              Leveraging artificial intelligence to provide instant emergency medical guidance,
              connect you with nearby hospitals and blood donors, and ensure help is always
              just a tap away.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="group flex items-center gap-2 text-sm text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Emergency Numbers */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Emergency Numbers
            </h3>
            <ul className="space-y-3">
              {emergencyNumbers.map((item) => (
                <li key={item.number}>
                  <a
                    href={`tel:${item.number}`}
                    className="group flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-red-900/30 border border-slate-700/50 hover:border-red-800/50 transition-all duration-200"
                  >
                    <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-red-600/20 text-red-400 group-hover:bg-red-600/30 transition-colors">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors">
                        {item.label}
                      </p>
                      <p className="text-lg font-bold text-white tracking-wider">
                        {item.number}
                      </p>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Connect */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Connect
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:snehakrishnamurthy25@gmail.com"
                  className="flex items-center gap-3 text-sm text-slate-400 hover:text-blue-400 transition-colors"
                >
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  snehakrishnamurthy25@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="tel:9036767664"
                  className="flex items-center gap-3 text-sm text-slate-400 hover:text-blue-400 transition-colors"
                >
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  +91 9036767664
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 text-sm text-slate-400">
                  <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Bengaluru, Karnataka, India</span>
                </div>
              </li>
            </ul>

            {/* Emergency CTA */}
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-red-900/40 to-red-800/20 border border-red-800/30">
              <p className="text-xs text-red-300 font-medium mb-1">In case of emergency</p>
              <a
                href="tel:112"
                className="flex items-center gap-2 text-white font-bold text-lg hover:text-red-300 transition-colors"
              >
                <Phone className="w-5 h-5" />
                Call 112
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              © 2025 LifeLink AI. All rights reserved.
            </p>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              Made with{' '}
              <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline-block" />{' '}
              for saving lives
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
