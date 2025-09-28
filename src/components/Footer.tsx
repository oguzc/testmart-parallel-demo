import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Premium gradient decoration */}
        <div className="footer-decoration"></div>
        
        <div className="footer-content">
          <div className="footer-grid">
            {/* Brand Section */}
            <div className="footer-brand">
              <h3 className="footer-brand-title">
                <span className="footer-brand-icon">🛒</span>
                TestMart
              </h3>
              <p className="footer-brand-description">
                Demonstrating scalable E2E testing architecture with Playwright's parallel execution, 
                worker isolation, and real-world e-commerce testing patterns.
              </p>
              <div className="footer-tech-badges">
                <span className="tech-badge">🎭 Playwright</span>
                <span className="tech-badge">⚡ React 19</span>
                <span className="tech-badge">📝 TypeScript</span>
                <span className="tech-badge">🔄 Parallel Tests</span>
              </div>
            </div>
            
            {/* Navigation Section */}
            <div className="footer-section">
              <h4 className="footer-section-title">Navigation</h4>
              <ul className="footer-links">
                <li><Link to="/" className="footer-link">🏠 Home</Link></li>
                <li><Link to="/products" className="footer-link">🛍️ Products</Link></li>
                <li><Link to="/cart" className="footer-link">🛒 Cart</Link></li>
                <li><Link to="/login" className="footer-link">👤 Sign In</Link></li>
              </ul>
            </div>
            
            {/* Playwright Resources Section */}
            <div className="footer-section">
              <h4 className="footer-section-title">Playwright Resources</h4>
              <ul className="footer-links">
                <li><a href="https://playwright.dev" className="footer-link" target="_blank" rel="noopener noreferrer">🎭 Playwright Docs</a></li>
                <li><a href="https://playwright.dev/docs/test-parallel" className="footer-link" target="_blank" rel="noopener noreferrer">� Parallel Testing</a></li>
                <li><a href="https://playwright.dev/docs/test-isolation" className="footer-link" target="_blank" rel="noopener noreferrer">🏰 Test Isolation</a></li>
                <li><a href="https://playwright.dev/docs/test-fixtures" className="footer-link" target="_blank" rel="noopener noreferrer">🧪 Test Fixtures</a></li>
              </ul>
            </div>
            
            {/* Advanced Testing Section */}
            <div className="footer-section">
              <h4 className="footer-section-title">Advanced Testing</h4>
              <ul className="footer-links">
                <li><a href="https://playwright.dev/docs/test-sharding" className="footer-link" target="_blank" rel="noopener noreferrer">🌌 Test Sharding</a></li>
                <li><a href="https://playwright.dev/docs/pom" className="footer-link" target="_blank" rel="noopener noreferrer">📄 Page Objects</a></li>
                <li><a href="https://playwright.dev/docs/api-testing" className="footer-link" target="_blank" rel="noopener noreferrer">🔌 API Testing</a></li>
                <li><a href="https://playwright.dev/docs/ci" className="footer-link" target="_blank" rel="noopener noreferrer">� CI/CD Integration</a></li>
              </ul>
            </div>
            
            {/* Demo Info Section */}
            <div className="footer-section">
              <h4 className="footer-section-title">Demo Features</h4>
              <div className="footer-info">
                <p className="footer-info-item">🌐 Worker Isolation</p>
                <p className="footer-info-item">🎯 Data Factories</p>
                <p className="footer-info-item">⚡ Parallel Execution</p>
                <p className="footer-info-item">🛡️ Test Reliability</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="footer-copyright">
              © 2025 TestMart Demo
            </p>
            <div className="footer-presentation">
              <p className="presentation-context">Conference Presentation:</p>
              <p className="presentation-title">"Parallel Universe: Architecting Scalable E2E Tests with Playwright"</p>
              <p className="presentation-subtitle">Exploring worker isolation, test reliability, and parallel execution patterns</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}