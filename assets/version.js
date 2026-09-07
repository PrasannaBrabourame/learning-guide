/* The site's version, displayed in every footer.
   This checked-in copy says "dev" on purpose: a local checkout served as-is is
   a dev build, and saying so is more honest than a stale number. The deploy
   workflow overwrites this file at publish time with the calendar date of the
   deployed commit, the commit count and the short SHA, so the published site
   is versioned automatically and nothing is ever bumped by hand. */
var GUIDE_VERSION = { v: 'dev', sha: '', date: '' };
