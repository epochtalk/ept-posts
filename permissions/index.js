var Joi = require('joi');

var validation =  Joi.object().keys({
  create: Joi.object().keys({
    allow: Joi.boolean(),
    bypass: Joi.object().keys({
      locked: Joi.object().keys({
        admin: Joi.boolean(),
        mod: Joi.boolean()
      }).xor('admin', 'mod')
    })
  }),
  byThread: Joi.object().keys({
    allow: Joi.boolean(),
    bypass: Joi.object().keys({
      viewDeletedPosts: Joi.object().keys({
        admin: Joi.boolean(),
        mod: Joi.boolean()
      }).xor('admin', 'mod')
    })
  }),
  find: Joi.object().keys({
    allow: Joi.boolean(),
    bypass: Joi.object().keys({
      viewDeletedPosts: Joi.object().keys({
        admin: Joi.boolean(),
        mod: Joi.boolean()
      }).xor('admin', 'mod')
    })
  }),
  search: Joi.object().keys({
    allow: Joi.boolean()
  }),
  pageByUser: Joi.object().keys({
    allow: Joi.boolean(),
    bypass: Joi.object().keys({
      viewDeletedUsers: Joi.boolean(),
      viewDeletedPosts: Joi.object().keys({
        admin: Joi.boolean(),
        mod: Joi.boolean()
      }).xor('admin', 'mod')
    })
  }),
  update: Joi.object().keys({
    allow: Joi.boolean(),
    bypass: Joi.object().keys({
      owner: Joi.object().keys({
        admin: Joi.boolean(),
        mod: Joi.boolean(),
        priority: Joi.boolean()
      }).xor('admin', 'mod', 'priority'),
      deleted: Joi.object().keys({
        admin: Joi.boolean(),
        mod: Joi.boolean(),
        priority: Joi.boolean()
      }).xor('admin', 'mod', 'priority'),
      locked: Joi.object().keys({
        admin: Joi.boolean(),
        mod: Joi.boolean(),
        priority: Joi.boolean()
      }).xor('admin', 'mod', 'priority')
    })
  }),
  delete: Joi.object().keys({
    allow: Joi.boolean(),
    bypass: Joi.object().keys({
      locked: Joi.object().keys({
        admin: Joi.boolean(),
        mod: Joi.boolean(),
        priority: Joi.boolean()
      }).xor('admin', 'mod', 'priority'),
      owner: Joi.object().keys({
        admin: Joi.boolean(),
        mod: Joi.boolean(),
        priority: Joi.boolean()
      }).xor('admin', 'mod', 'priority')
    })
  }),
  lock: Joi.object().keys({
    allow: Joi.boolean(),
    bypass: Joi.object().keys({
      lock: Joi.object().keys({
        admin: Joi.boolean(),
        mod: Joi.boolean(),
        priority: Joi.boolean()
      }).xor('admin', 'mod', 'priority')
    })
  }),
  purge: Joi.object().keys({
    allow: Joi.boolean(),
    bypass: Joi.object().keys({
      purge: Joi.object().keys({
        admin: Joi.boolean(),
        mod: Joi.boolean()
      }).xor('admin', 'mod')
    })
  }),
});

var superAdministrator = {
  search: { allow: true },
  create: {
    allow: true,
    bypass: { locked: { admin: true } }
  },
  byThread: {
    allow: true,
    bypass: { viewDeletedPosts: { admin: true } }
  },
  find: {
    allow: true,
    bypass: { viewDeletedPosts: { admin: true } }
  },
  pageByUser: {
    allow: true,
    bypass: {
      viewDeletedUsers: true,
      viewDeletedPosts: { admin: true }
    }
  },
  update: {
    allow: true,
    bypass: {
      owner: { admin: true },
      deleted: { admin: true },
      locked: { admin: true }
    }
  },
  delete: {
    allow: true,
    bypass: {
      locked: { admin: true },
      owner: { admin: true }
    }
  },
  lock: {
    allow: true,
    bypass: { purge: { admin: true } }
  },
  purge: {
    allow: true,
    bypass: { purge: { admin: true } }
  }
};

var administrator = {
  search: { allow: true },
  create: {
    allow: true,
    bypass: { locked: { admin: true } }
  },
  byThread: {
    allow: true,
    bypass: { viewDeletedPosts: { admin: true } }
  },
  find: {
    allow: true,
    bypass: { viewDeletedPosts: { admin: true } }
  },
  pageByUser: {
    allow: true,
    bypass: {
      viewDeletedUsers: true,
      viewDeletedPosts: { admin: true }
    }
  },
  update: {
    allow: true,
    bypass: {
      owner: { admin: true },
      deleted: { admin: true },
      locked: { admin: true }
    }
  },
  delete: {
    allow: true,
    bypass: {
      locked: { admin: true },
      owner: { admin: true }
    }
  },
  lock: {
    allow: true,
    bypass: { purge: { admin: true } }
  },
  purge: {
    allow: true,
    bypass: { purge: { admin: true } }
  }
};

var globalModerator = {
  search: { allow: true },
  create: {
    allow: true,
    bypass: { locked: { admin: true } }
  },
  byThread: {
    allow: true,
    bypass: { viewDeletedPosts: { admin: true } }
  },
  find: {
    allow: true,
    bypass: { viewDeletedPosts: { admin: true } }
  },
  pageByUser: {
    allow: true,
    bypass: {
      viewDeletedUsers: true,
      viewDeletedPosts: { admin: true }
    }
  },
  update: {
    allow: true,
    bypass: {
      owner: { admin: true },
      deleted: { admin: true },
      locked: { admin: true }
    }
  },
  delete: {
    allow: true,
    bypass: {
      locked: { admin: true },
      owner: { admin: true }
    }
  },
  lock: {
    allow: true,
    bypass: { purge: { admin: true } }
  }
};

var moderator = {
  search: { allow: true },
  create: {
    allow: true,
    bypass: { locked: { mod: true } }
  },
  byThread: {
    allow: true,
    bypass: { viewDeletedPosts: { mod: true } }
  },
  find: {
    allow: true,
    bypass: { viewDeletedPosts: { mod: true } }
  },
  pageByUser: {
    allow: true,
    bypass: {
      viewDeletedUsers: true,
      viewDeletedPosts: { mod: true }
    }
  },
  update: {
    allow: true,
    bypass: {
      owner: { mod: true },
      deleted: { mod: true },
      locked: { mod: true }
    }
  },
  delete: {
    allow: true,
    bypass: {
      locked: { mod: true },
      owner: { mod: true }
    }
  },
  lock: {
    allow: true,
    bypass: { purge: { mod: true } }
  }
};

var patroller = {
  search: { allow: true },
  create: { allow: true },
  byThread: { allow: true },
  find: { allow: true },
  pageByUser: { allow: true },
  update: {
    allow: true,
    bypass: {
      owner: { priority: true },
      deleted: { priority: true },
      locked: { priority: true }
    }
  },
  delete: {
    allow: true,
    bypass: {
      locked: { priority: true },
      owner: { priority: true }
    }
  },
  lock: {
    allow: true,
    bypass: { purge: { priority: true } }
  }
};

var user = {
  search: { allow: true },
  create: { allow: true },
  byThread: { allow: true },
  find: { allow: true },
  pageByUser: { allow: true },
  update: { allow: true },
  delete: { allow: true }
};

var newbie = {
  search: { allow: true },
  create: { allow: true },
  byThread: { allow: true },
  find: { allow: true },
  pageByUser: { allow: true },
  update: { allow: true },
  delete: { allow: true }
};

var banned = {
  byThread: { allow: true },
  find: { allow: true },
  pageByUser: { allow: true },
};

var anonymous = {
  byThread: { allow: true },
  find: { allow: true },
  pageByUser: { allow: true },
};

var layout = {
  search: {
    title: 'Search Posts'
  },
  create: {
    title: 'Create Posts',
    bypasses: [ { description: 'Ignore Thread Lock', control: 'locked' } ],
  },
  byThread: {
    title: 'View Thread Posts',
    bypasses: [ { description: 'View Deleted Posts', control: 'viewDeletedPosts' } ]
  },
  find: {
    title: 'View Single Post',
    bypasses: [ { description: 'View Deleted Posts', control: 'viewDeletedPosts' } ]
  },
  pageByUser: {
    title: 'View User Posts',
    bypasses: [
      { description: 'View Deleted Users', control: 'viewDeletedUsers', type: 'boolean'},
      { description: 'View Deleted Posts', control: 'viewDeletedPosts' }
    ]
  },
  update: {
    title: 'Update Posts',
    bypasses: [
      { description: 'Ignore Post Ownership', control: 'owner', type: 'priority' },
      { description: 'Ignore Deleted Posts', control: 'deleted', type: 'priority' },
      { description: 'Ignore Thread Lock', control: 'locked', type: 'priority' }
    ]
  },
  delete: {
    title: 'Delete Posts',
    bypasses: [
      { description: 'Ignore Post Ownership', control: 'owner', type: 'priority' },
      { description: 'Ignore Thread Lock', control: 'locked', type: 'priority' }
    ]
  },
  lock: {
    title: 'Lock Posts (lock level required)',
    bypasses: [ { description: 'Lock Level', control: 'lock', type: 'priority' } ]
  },
  purge: {
    title: 'Purge Posts (purge level required)',
    bypasses: [ { description: 'Purge Level', control: 'purge' } ]
  }
};

module.exports = {
  validation: validation,
  layout: layout,
  defaults: {
    superAdministrator: superAdministrator,
    administrator: administrator,
    globalModerator: globalModerator,
    moderator: moderator,
    patroller: patroller,
    user: user,
    newbie: newbie,
    banned: banned,
    anonymous: anonymous,
    private: {}
  }
};
