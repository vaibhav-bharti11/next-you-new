if (location.pathname === '/admin' || location.pathname.startsWith('/admin/')) {
  import('./cms.js');
} else {
  import('./main.js');
  import('./store-content.js');
}
