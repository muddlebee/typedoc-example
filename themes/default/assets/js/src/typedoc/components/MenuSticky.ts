module typedoc
{
    /**
     * Defines the known ways to make the navigation sticky.
     */
    enum StickyMode
    {
        /**
         * The navigation is not sticky at all.
         */
        None,

        /**
         * The entire secondary navigation will stick to the top.
         */
        Secondary,

        /**
         * Only the current root navigation item will stick to the top.
         */
        Current
    }


    /**
     * Manages the sticky state of the navigation and moves the highlight
     * to the current navigation item.
     */
    export class MenuSticky extends Backbone.View<any>
    {
        /**
         * jQuery instance of the current navigation item.
         */
        private $current:JQuery;

        /**
         * jQuery instance of the parent representing the entire navigation.
         */
        private $navigation:JQuery;

        /**
         * jQuery instance of the parent representing entire sticky container.
         */
        private $container:JQuery;

        /**
         * The current state of the menu.
         */
        private state:string = '';

        /**
         * The current mode for determining the sticky position.
         */
        private stickyMode:StickyMode = StickyMode.None;

        /**
         * The threshold at which the menu is attached to the top.
         */
        private stickyTop:number;

        /**
         * The threshold at which the menu is attached to the bottom.
         */
        private stickyBottom:number;


        /**
         * Create a new MenuSticky instance.
         */
        constructor(options:Backbone.ViewOptions<any>) {
            super(options);

            this.$current    = this.$el.find('> ul.current');
            this.$navigation = this.$el.parents('.col-4');
            this.$container  = this.$el.parents('.row');

            this.listenTo(viewport, 'resize', this.onResize);
            this.listenTo(viewport, 'scroll', this.onScroll);

            this.onResize(viewport.width, viewport.height);
        }


        /**
         * Set the current sticky state.
         *
         * @param state  The new sticky state.
         */
        private setState(state:string) {
            if (this.state == state) return;

            if (this.state != '') this.$el.removeClass(this.state);
            this.state = state;
            if (this.state != '') this.$el.addClass(this.state);
        }


        /**
         * Triggered when the viewport was resized.
         *
         * @param width   The width of the viewport.
         * @param height  The height of the viewport.
         */
        private onResize(width:number, height:number) {
            this.stickyMode = StickyMode.None;
            this.setState('');

            var containerHeight = this.$container.height();
            if (this.$navigation.height() < containerHeight) {
                var elHeight = this.$el.height();
                var elTop    = this.$el.offset().top;

                if (this.$current.length) {
                    var currentHeight = this.$current.height();
                    var currentTop    = this.$current.offset().top;

                    this.$el.css('top', elTop - currentTop + 20);
                    if (currentHeight < height) {
                        var bottom        = this.$container.offset().top + containerHeight;
                        this.stickyMode   = StickyMode.Current;
                        this.stickyTop    = currentTop;
                        this.stickyBottom = bottom - elHeight + (currentTop - elTop) - 40;
                    }
                }

                if (elHeight < height) {
                    this.stickyMode = StickyMode.Secondary;
                    this.stickyTop  = elTop;
                }
            }

            this.onScroll(viewport.scrollTop);
        }


        /**
         * Triggered when the viewport was scrolled.
         *
         * @param scrollTop  The current vertical scroll position.
         */
        private onScroll(scrollTop:number) {
            if (this.stickyMode == StickyMode.Current) {
                if (scrollTop > this.stickyBottom) {
                    this.setState('sticky-bottom');
                } else {
                    this.setState(scrollTop + 20 > this.stickyTop ? 'sticky-current' : '');
                }
            } else if (this.stickyMode == StickyMode.Secondary) {
                this.setState(scrollTop + 20 > this.stickyTop ? 'sticky' : '');
            }
        }
    }


    /**
     * Register this component.
     */
    registerComponent(MenuSticky, '.tsd-navigation.secondary');
}