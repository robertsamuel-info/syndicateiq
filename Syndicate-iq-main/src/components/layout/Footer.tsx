export function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between text-sm text-gray-400">
        <p>© 2025 SyndicateIQ. Built for LMA Hackathon.</p>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-gray-300 transition-colors">
            Privacy
          </a>
          <a href="#" className="hover:text-gray-300 transition-colors">
            Terms
          </a>
          <a href="#" className="hover:text-gray-300 transition-colors">
            Support
          </a>
        </div>
      </div>
    </footer>
  );
}
