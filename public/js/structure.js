(function() {
  var __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['jquery', 'backbone', 'jgrowl', 'localstorage'], function($, Backbone) {
    var Account, AccountView, AppView, NavView, Page, PageView, PagesCollection, ProgressBar, Router, notify;
    notify = function() {
      var args, _ref;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return (_ref = $("#jGrowl-container")).jGrowl.apply(_ref, args);
    };
    ProgressBar = (function(_super) {

      __extends(ProgressBar, _super);

      function ProgressBar() {
        return ProgressBar.__super__.constructor.apply(this, arguments);
      }

      ProgressBar.prototype.el = $('#progressbar');

      ProgressBar.prototype.render = function() {
        if (this.model.current_page().get('progressbar')) {
          return this.$el.css({
            opacity: ''
          });
        } else {
          return this.$el.css({
            opacity: 0
          });
        }
      };

      ProgressBar.prototype.initialize = function() {
        _.bindAll(this);
        return this.model.on('change:selected', this.render);
      };

      return ProgressBar;

    })(Backbone.View);
    /**
    	 * modify the navbar to highlight the correct current page
    */

    NavView = (function(_super) {

      __extends(NavView, _super);

      function NavView() {
        return NavView.__super__.constructor.apply(this, arguments);
      }

      NavView.prototype.el = $('#navbar');

      NavView.prototype.render = function() {
        var page;
        page = this.model.current_page().get('name');
        document.title = "" + (page.replace("_", " ").title_case()) + " | CSD";
        this.$el.find("\#" + page + "_nav").attr("checked", true);
        return notify("(nav) page: " + page);
      };

      NavView.prototype.initialize = function() {
        _.bindAll(this);
        return this.model.on('change:selected', this.render);
      };

      return NavView;

    })(Backbone.View);
    /**
    	 * represents the current user. holds all the user data and interacts with
    	   the server for account functions
    */

    Account = (function(_super) {

      __extends(Account, _super);

      function Account() {
        return Account.__super__.constructor.apply(this, arguments);
      }

      Account.prototype.localStorage = new Backbone.LocalStorage("Account");

      Account.prototype.login = function(username, password) {
        return $.ajax({
          url: "" + SERVER + "/user/login",
          type: "POST",
          data: {
            username: username,
            password: password
          }
        }).done(function(data) {
          return App.Account.save({
            token: data['token']
          });
        }).fail(function(jqXHR, textStatus, errorThrown) {
          return notify("" + errorThrown + ": " + textStatus, {
            theme: 'error'
          });
        });
      };

      Account.prototype.logout = function() {
        console.log('logg\'n out');
        return this.save({
          token: ''
        });
      };

      Account.prototype.initialize = function() {
        var k, v, _ref, _results;
        _.bindAll(this);
        this.fetch();
        _ref = this.get(0);
        _results = [];
        for (k in _ref) {
          v = _ref[k];
          _results.push(this.set(k, v));
        }
        return _results;
      };

      return Account;

    })(Backbone.Model);
    /**
    	 * modifies the navbar to show the correct user & login/logout controls
    */

    AccountView = (function(_super) {

      __extends(AccountView, _super);

      function AccountView() {
        return AccountView.__super__.constructor.apply(this, arguments);
      }

      AccountView.prototype.el = $('#account_bar');

      AccountView.prototype.render = function() {
        this.$el.find('[for="account_nav"]')[0].innerHTML = this.model.get('name');
        if (this.model.get('token') === '') {
          this.$el.find('[for="login_nav"]').attr({
            'original-title': 'Login'
          });
          $('#login_icon')[0].style.display = 'inline';
          return $('#logout_icon')[0].style.display = 'none';
        } else {
          this.$el.find('[for="login_nav"]').attr({
            'original-title': 'Logout'
          });
          $('#login_icon')[0].style.display = 'none';
          return $('#logout_icon')[0].style.display = 'inline';
        }
      };

      AccountView.prototype.initialize = function() {
        _.bindAll(this);
        this.model.on('change:token', this.render);
        return this.model.view = this;
      };

      return AccountView;

    })(Backbone.View);
    Router = (function(_super) {

      __extends(Router, _super);

      function Router() {
        return Router.__super__.constructor.apply(this, arguments);
      }

      Router.prototype.routes = {
        "*page": "change_page"
      };

      Router.prototype.change_page = function(page) {
        if (page !== "") {
          return this.model.change_page(page);
        }
      };

      Router.prototype.initialize = function(options) {
        return this.model = options.model;
      };

      return Router;

    })(Backbone.Router);
    Page = (function(_super) {

      __extends(Page, _super);

      function Page() {
        return Page.__super__.constructor.apply(this, arguments);
      }

      Page.prototype.defaults = {
        name: '',
        login_required: false,
        selected: false,
        progressbar: false,
        first_load: (function() {}),
        on_load: (function() {}),
        on_unload: (function() {}),
        controls: {}
      };

      Page.prototype.trigger_control = function(name) {
        return this.controls[name]();
      };

      Page.prototype.sync = function() {
        return false;
      };

      Page.prototype.onchange = function() {
        if (this.get('selected')) {
          return this.get('on_load').call();
        } else {
          return this.get('on_unload').call();
        }
      };

      Page.prototype.initialize = function() {
        _.bindAll(this);
        this.on('change:selected', this.onchange);
        return this.get('first_load').call();
      };

      return Page;

    })(Backbone.Model);
    PageView = (function(_super) {

      __extends(PageView, _super);

      function PageView() {
        return PageView.__super__.constructor.apply(this, arguments);
      }

      PageView.prototype.render = function() {
        var control, control_name, _i, _j, _len, _len1, _ref, _ref1, _results;
        if (this.model.get('selected')) {
          this.el.style.display = 'block';
          _ref = $('#local_controls button');
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            control = _ref[_i];
            control.style.display = 'none';
            $(control).unbind("click");
          }
          _ref1 = _.keys(this.model.get('controls'));
          _results = [];
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            control_name = _ref1[_j];
            control = $("#" + control_name + "_ctrl")[0];
            control.style.display = 'inline-block';
            _results.push($(control).bind("click", this.model.get('controls')[control_name]));
          }
          return _results;
        } else {
          return this.el.style.display = 'none';
        }
      };

      PageView.prototype.initialize = function() {
        _.bindAll(this);
        this.model.on('change:selected', this.render);
        this.model.view = this;
        return this.el = $("\#" + (this.model.get('name')) + "_content")[0];
      };

      return PageView;

    })(Backbone.View);
    PagesCollection = (function(_super) {

      __extends(PagesCollection, _super);

      function PagesCollection() {
        return PagesCollection.__super__.constructor.apply(this, arguments);
      }

      PagesCollection.prototype.model = Page;

      PagesCollection.prototype.default_page = 'input';

      PagesCollection.prototype.added_page = function(page_model) {
        return new PageView({
          model: page_model
        });
      };

      PagesCollection.prototype.control = function(name) {};

      PagesCollection.prototype.change_page = function(page_name) {
        var page;
        page = this.find(function(page_obj) {
          return page_obj.get('name') === page_name;
        });
        try {
          this.current_page().set({
            selected: false
          });
        } catch (_error) {}
        if (page != null) {
          return page.set({
            selected: true
          });
        } else {
          notify("" + page_name + " doesn't exist, redirecting to " + this.default_page + "...", {
            theme: 'error',
            sticky: true
          });
          return App.Router.navigate(this.default_page, {
            trigger: true,
            replace: true
          });
        }
      };

      /**
      		 * @return Page the model of the active page
      */


      PagesCollection.prototype.current_page = function() {
        return this.where({
          selected: true
        })[0];
      };

      PagesCollection.prototype.initialize = function() {
        _.bindAll(this);
        return this.on("add", this.added_page);
      };

      return PagesCollection;

    })(Backbone.Collection);
    AppView = (function(_super) {

      __extends(AppView, _super);

      function AppView() {
        return AppView.__super__.constructor.apply(this, arguments);
      }

      AppView.prototype.initialize = function() {
        _.bindAll(this);
        this.Pages = new PagesCollection();
        this.Router = new Router({
          model: this.Pages
        });
        this.NavView = new NavView({
          model: this.Pages
        });
        this.ProgressBar = new ProgressBar({
          model: this.Pages
        });
        this.Account = new Account();
        return this.AccountView = new AccountView({
          model: this.Account
        });
      };

      return AppView;

    })(Backbone.View);
    window.App = new AppView();
    return App;
  });

}).call(this);
