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
        mod: Joi.boolean()
      }).xor('admin', 'mod'),
      deleted: Joi.object().keys({
        admin: Joi.boolean(),
        mod: Joi.boolean()
      }).xor('admin', 'mod'),
      locked: Joi.object().keys({
        admin: Joi.boolean(),
        mod: Joi.boolean()
      }).xor('admin', 'mod')
    })
  }),
  delete: Joi.object().keys({
    allow: Joi.boolean(),
    bypass: Joi.object().keys({
      locked: Joi.object().keys({
        admin: Joi.boolean(),
        mod: Joi.boolean()
      }).xor('admin', 'mod'),
      owner: Joi.object().keys({
        admin: Joi.boolean(),
        mod: Joi.boolean()
      }).xor('admin', 'mod')
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
  purge: {
    allow: true,
    bypass: { purge: { admin: true } }
  }
};

var administrator = {
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
  purge: {
    allow: true,
    bypass: { purge: { admin: true } }
  }
};

var globalModerator = {
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
  }
};

var moderator = {
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
  }
};

var user = {
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
      { description: 'Ignore Post Ownership', control: 'owner' },
      { description: 'Ignore Deleted Posts', control: 'deleted' },
      { description: 'Ignore Thread Lock', control: 'locked' }
    ]
  },
  delete: {
    title: 'Delete Posts',
    bypasses: [
      { description: 'Ignore Post Ownership', control: 'owner' },
      { description: 'Ignore Thread Lock', control: 'locked' }
    ]
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
    user: user,
    banned: banned,
    anonymous: anonymous,
    private: {}
  }
};
