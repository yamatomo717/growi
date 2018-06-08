class CustomSidebar {

  constructor(crowi) {
    this.crowi = crowi;

    // init content cache
    this.updateContentCache();
  }

  updateContentCache() {
    const Revision = this.crowi.model('Revision');

    Revision.findLatestRevision('/Sidebar')
      .then(revision => {
        if (revision != null) {
          this.contentCache = revision.body;
        }
      });
  }

  get middleware() {
    return (req, res, next) => {
      if (this.contentCache != null) {
        res.locals.sidebar = {
          content: this.contentCache
        };
      }

      next();
    };
  }
}

module.exports = CustomSidebar;
