// Handle sidebar active state based on scroll position
document.addEventListener('DOMContentLoaded', () => {
  const navItems = document.querySelectorAll('.nav-item');
  
  function updateActiveNav() {
    // Get all content sections
    const sections = document.querySelectorAll('.content-section');
    
    // Determine which section is most visible
    let activeSection = null;
    let maxVisibility = 0;
    
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate how much of the section is visible
      const topInView = Math.max(0, rect.top);
      const bottomInView = Math.min(windowHeight, rect.bottom);
      const visibleHeight = bottomInView - topInView;
      const visibility = visibleHeight / Math.min(rect.height, windowHeight);
      
      if (visibility > maxVisibility) {
        maxVisibility = visibility;
        activeSection = section.id;
      }
    });
    
    // Update active nav item
    navItems.forEach(item => {
      const section = item.getAttribute('data-section');
      if (section === activeSection) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }
  
  // Listen to scroll events
  window.addEventListener('scroll', updateActiveNav);
  
  // Handle nav item clicks
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const sectionId = item.getAttribute('data-section');
      const section = document.getElementById(sectionId);
      
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Update active state immediately
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
      }
    });
  });
  
  // Initial update
  updateActiveNav();
});
