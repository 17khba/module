/* --- 滑块移动距离 / 滑块可移动距离 = 内容滚动高度 /  内容可滚动高度；---*/

(function(win, doc, $){
    /**
     * [CusScrollBar 自定义滚动条类方法]
     * @param {[obj]} options [配置项]
     */
    function CusScrollBar(options) {
        this._init(options);
    }
    $.extend(CusScrollBar.prototype, {
        _init: function(options) {
            const self = this;
            self.options = {
                scrollDir: 'y',         // 滚动的方向
                contSelector: '',       // 滚动内容区元素
                barSelector: '',        // 滚动条元素
                sliderSelector: '',     // 滚动滑块元素
                tabItemSelector: '.tab-item',    // 标签对象
                tabActiveClass: 'tab-active',    // 选中标签类名
                anchorSelector: '.anchor',       // 锚点选择器
                wheelStep: 10           // 滚轮步长
            };
            $.extend(true, self.options, options || {});
            self._initDomEvent();
            return self;
        },
        // 初始化DOM引用
        _initDomEvent: function(){
            const opts = this.options;
            // 文档对象
            this.$doc = $(doc);
            // 内容区对象
            this.$cont = $(opts.contSelector);
            // 滚动条对象
            this.$bar = opts.barSelector ? $(opts.barSelector) : self.$slider.parent();
            // 滚动滑块儿
            this.$slider = $(opts.sliderSelector);
            // 锚点项
            this.$anchor = $(opts.anchorSelector);
            // 标签项
            this.$tabItem = $(opts.tabItemSelector);

            this._initSliderDragEvent()
                ._initTabEvent()
                ._bindContScroll()
                ._bindMouseWheel();
        },
        // 初始化滑块拖动功能
        _initSliderDragEvent: function(){
            const self = this;
            const slider = this.$slider;
            const sliderEle = slider[0];

            if (sliderEle) {
                const doc = this.$doc;
                let dragStartPagePos;
                let dragStartScrollPos;
                let dragContBarRate;

                function mousemoveHandler (e) {
                    e.preventDefault();
                    // 判断是否在滑块上按下鼠标
                    // if (dragStartPagePos == null) return;
                    self.scrollTo(dragStartScrollPos + (e.pageY - dragStartPagePos) * dragContBarRate);
                }

                slider.on('mousedown', function(e) {
                    e.preventDefault();
                    dragStartPagePos = e.pageY;         // 鼠标在y轴上的坐标
                    dragStartScrollPos = self.$cont[0].scrollTop;       // 内容区超出文档的高度
                    // 内容可滚动高度/滑块儿可滚动高度
                    dragContBarRate = self.getMaxScrollPos() / self.getMaxSliderPos();
                    doc.on('mousemove.scroll', mousemoveHandler).on('mouseup.scroll', function() {
                        doc.off('.scroll');
                    });
                });
            }
            return self;
        },
        /**
         * [_initTabEvent 初始化标签切换功能]
         * @return {[obj]}
         */
        _initTabEvent: function(){
            var self = this;
            self.$tabItem.on('click', function(e){
                e.preventDefault();
                const index = $(this).index();
                self.changeTabSelect(index);
                // 已经滚出可视区的内容高度 +　指定锚点与内容容器的距离
                self.scrollTo(self.$cont[0].scrollTop + self.getAnchorPos(index));
            });
            return self;
        },
        /**
         * [changeTabSelect 切换标签的选中]
         * @param  {[num]} index [对应元素的index值]
         * @return {[obj]}       [self]
         */
        changeTabSelect: function(index){
            const self = this;
            const active = self.options.tabActiveClass;
            return self.$tabItem.eq(index).addClass(active).siblings().removeClass(active);
        },
        getAnchorPos: function(index){
            return this.$anchor.eq(index).position().top;
        },
        getAllAnchorPos: function () {
            const self = this;
            const allAnchorPos = [];
            for (let i = 0; i < self.$anchor.length; i++) {
                allAnchorPos.push(self.$cont[0].scrollTop + self.getAnchorPos(i));
            }
            return allAnchorPos;
        },
        /**
         * [_bindContScroll 监听内容的滚动，同步滑块的位置]
         * @return {[obj]} [self对象]
         */
        _bindContScroll: function(){
            const self = this;
            self.$cont.on('scroll', function(){
                var sliderEle = self.$slider && self.$slider[0];
                if(sliderEle){
                    sliderEle.style.top = self.getSliderPos() + 'px';
                };
            });
            return self;
        },
        _bindMouseWheel: function(){
            const self = this;
            self.$cont.on('mousewheel DOMMouseScroll', function (e) {
                e.preventDefault();
                var oEvent, wheelRange;
                oEvent = e.originalEvent;
                wheelRange = oEvent.wheelDelta ? (-oEvent.wheelDelta / 120) : (oEvent.detail / 3);
                self.scrollTo(self.$cont[0].scrollTop + wheelRange * self.options.wheelStep);
            })
            return self;
        },
        /**
         * [getSliderPos 计算滑块当前的移动的距离]
         * @return {[num]}
         */
        getSliderPos: function(){
            const self = this;
            const maxSliderPos = self.getMaxSliderPos();
            return Math.min(maxSliderPos, maxSliderPos * self.$cont[0].scrollTop / self.getMaxScrollPos());
        },
        /**
         * [getMaxScrollPos 内容可滚动的高度]
         * @return {[num]} [可滚动的高度]
         */
        getMaxScrollPos: function(){
            const self = this;
            return  self.$cont[0].scrollHeight - self.$cont.innerHeight();
        },
        /**
         * [getMaxSliderPos 滑块儿可滚动的高度]
         * @return {[num]}
         */
        getMaxSliderPos: function(){
            const self = this;
            return self.$bar.height() - self.$slider.height();
        },
        /**
         * [scrollTo 设置元素的scrollTop值]
         * @param  {[num]} posVal [要滚动到的值]
         */
        scrollTo: function(posVal){
            const self = this;
            const posArr = self.getAllAnchorPos();
            const getIndex = (Val) => {
                for (let i = posArr.length - 1; i >= 0; i--) {
                    if (Val >= posArr[i]) {
                        return i;
                    } else {
                        continue;
                    }
                }
            }

            if (self.$tabItem.length == posArr.length) {
                self.changeTabSelect(getIndex(posVal));
            }
            self.$cont.scrollTop(posVal);
        }
    });
    win.CusScrollBar = CusScrollBar;
})(window, document, jQuery);

new CusScrollBar({
    contSelector: '.scroll-cont',              // 滚动内容器
    barSelector: '.scroll-bar',                // 滚动条容器
    sliderSelector: '.scroll-silder'           // 滚动滑块儿
});
