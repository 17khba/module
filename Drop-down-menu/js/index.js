var createSelect = (function(){

function _oSelect(ele){

	this.onoff = true;
	this.oSel = $('#' + ele);
	this.txt = $('#' + ele).find('span');
	this.oNext = $('#' + ele).next();
	this.aLi = $('#' + ele).next().children();
	this.init();

}

_oSelect.prototype = {

	init: function(){

		var self = this;

		this.oSel.on('click', function(){
			if(self.onoff){
				self.oNext.show();
			} else{
				self.oNext.hide();
			}
			self.onoff = !self.onoff;
			return false;
		});

		/*列表项点击事件*/
		this.oNext.delegate(this.aLi, 'click', function(event) {
			var oTarget = $(event.target);
			self.txt.text(oTarget.text());
			self.oNext.hide();
			self.onoff = true;
			return false;
		});

		/*点击目标区域外内容，隐藏下拉菜单*/
		$(document).mouseup(function(e){
		  	if(!self.oSel.is(e.target) && self.oSel.has(e.target).length === 0 && (!self.onoff)){
		    	self.oNext.hide();
		    	self.onoff = true;
		  	}
		});

	}

};

return _oSelect;

})();

var oNotice, oDropMenu;
oNotice = new createSelect('notice_sel');
oDropMenu = new createSelect('drop_sel');