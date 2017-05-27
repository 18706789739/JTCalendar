(function($){
	
	$.fn.JTCalendar = function(options){

		options.$elm = $(this);

		var Calendar = new JTCalendar(options)

		this.click(function(){
			Calendar.showCalendar()
		})

	}

	function JTCalendar(options){

		var defaults = {
			title:'选择日期',
			monthNumber:1,
			minDay:1,
			inTime:false,
			onClick:function(){},
		}

		var ops = $.extend({}, defaults, options);

		var JT = {

			
			_cache:{
				clickNum:0,
			},

			_todayVal:new Date().setHours(0,0,0,0),

			/*增加天数*/
			_addDay:function(date,num){

				var value 	= date;
					num 	= num || 1; 

				if(value instanceof Date){

					value = date.valueOf();

				}

				return (value/1000+86400*num)*1000;

			},

			/*获取某年某月1号前的空位值*/
			_getMonthPreDay:function(d){

				return new Date(d.year,d.month,1).getDay();

			},

			/*获取当月天数*/
			_getCountDays:function(d){

				var curDate = new Date(d.year,d.month+1,0);

				return curDate.getDate();

			},

			/*获取开始到结束时间的天数*/
			_getTimesDay:function(d1,d2){
				var inTime 	= d1,
					outTime = d2;
				if(typeof inTime == 'string'){
					inTime = new Date(inTime);
				}
				if(typeof outTime == 'string'){
					outTime = new Date(outTime);
				}
				return (outTime-inTime )/(24*60*60*1000);
			},

			_getDayText:function(o){

				if(o instanceof Date){

					var oVal 		= o.valueOf(),
						toDayVal 	= this._todayVal;

					if(oVal == toDayVal){

						return '今天';

					}else if(this._getTimesDay( toDayVal,oVal ) == 1 ){

						return '明天';

					}else if(this._getTimesDay( toDayVal,oVal ) == 2 ){

						return '后天';

					}else{
						return this._getDayTextSwitch(o.getDay()) ;
					}

				}

				
			},

			_getDayTextSwitch:function(num){
				switch (num){

					case 0:
					return '周天';

					case 1:
					return '周一';

					case 2:
					return '周二';

					case 3:
					return '周三';

					case 4:
					return '周四';

					case 5:
					return '周五';

					case 6:
					return '周六';

					default:
					return false;

				}
			},

			/*将Date类型转为字符串*/
			_dateObjToJson:function(dateObj,domStatu){
				var domStatu = domStatu || false;
				var o = dateObj;

				if(typeof o == 'number'){

					o = new Date(o)

				}else if(typeof o == 'undefined'){

					o = new Date();

				}

				var date 	= domStatu ? this._zfill(o.getDate(),2) :o.getDate(),
					month 	= domStatu ? this._zfill(o.getMonth()+1,2) :o.getMonth();

				return {
					valueOf:o.valueOf(),
					date:date, 		//天(1 ~ 31)
					day:o.getDay(),			//周几(0 ~ 6)
					dayText:this._getDayText(o),
					month:month, 		//月份 (0 ~ 11)
					year:o.getFullYear(),
					dateStr:o.getFullYear()+'-'+(o.getMonth()+1)+'-'+o.getDate()
				}

			},

			_zfill:function(num, size) {
			    var s = "000000000" + num;
			    return s.substr(s.length-size);
			},

			/*将字符串转为Date类型*/
			_strToDateObj:function(str){

				if(typeof str != 'string'){
					return false;
				}

				return new Date(str)

			},

			/*返回每天的属性*/
			_checkDay:function(d,day){

				var propDay = new Date(d.year,d.month,day).getTime(),
					toDay 	= this._todayVal,	
					o = {
						className:'js_calendar_item jt_cld_day_havetxt',
						date:day,
						text:'',
					}

				/*是否是过去的天数 */
				if(toDay > propDay){	

					o.className += ' jt_cld_daypass js_invalid';

					return o;

				}

				/*是否是今明后天*/
				if(toDay === propDay){

					o.className += ' jt_cld_today';

					o.date='今天';

				}else if(this._getTimesDay(toDay,propDay) === 1){

					o.className += ' jt_cld_today';

					o.date='明天';

				}else if(this._getTimesDay(toDay,propDay) === 2){

					o.className += ' jt_cld_today';

					o.date='后天';

				}

				/*如果传入了inTime*/
				if(typeof ops.inTime != 'boolean'){

					/*是否是入住时间*/
					if(propDay === ops.inTimeVal){

						o.className += ' jt_choose-day';

						o.text='入住';

					}
					/*是否是入住时间*/
					if(propDay === ops.outTimeVal){

						o.className += ' jt_choose-day';

						o.text='退房';

					}
				}




				
				
				return o;
			},
			/*检查传入的数据*/
			_checkOps:function(){

				/*如果传入了ops.inTime*/
				if( ops.inTime ) {
					
					/*如果入住时间为时间戳或者Date对象*/
					if(typeof ops.inTime == 'number' || ops.inTime instanceof Date){
						
						ops.inTime = this._dateObjToJson(ops.inTime).dateStr;

					}

					/*如果入住时间是字符串('xxxx-xx-xx')*/
					if (typeof ops.inTime == 'string'){

						ops.inTimeVal 	= this._strToDateObj(ops.inTime).valueOf();

						ops.outTimeVal 	= this._addDay(ops.inTimeVal,ops.minDay);

						ops.outTime 	= this._dateObjToJson(ops.outTimeVal).dateStr;

						this._renderMessge();

					}else{
						console.warn('请检查inTime类型')
					}
				}

			},

			/*渲染星期*/
			_renderWeek:function(){
				return $('<ul class="jt_cldweek"> <li>日</li><li>一</li><li>二</li><li>三</li><li>四</li><li>五</li><li>六</li> </ul>')
			},

			/*渲染年月份*/
			_renderDateTime:function(d){
				return $('<h1 class="jt_cldmonth">'+d.year+'年'+(d.month+1)+'月</h1>')
			},

			/*生成空位标签*/
			_renderDatePreDay:function(d,$elm){

				var i = 0,
					preDay = this._getMonthPreDay(d);

				for(i=0; i<preDay; i++){
					$elm.append($('<li class="jt_cld_day_havetxt jt_cld_day_havetxt jt_cld_daypass js_invalid"><em></em></li>'))
				}

				return $elm;

			},

			/*生成每天标签*/
			_renderDateDay:function(d,$elm){

				/*获取当月天数*/
				var i = 0,
					o = {},
					dataDate = '',
					dayLength = this._getCountDays(d);

				for(i=1; i<=dayLength; i++){
					o =this._checkDay(d,i);
					dataDate = d.year+'-'+(d.month+1)+'-'+i;
					$elm.append($('<li class="'+o.className+'" data-date='+dataDate+'><em>'+o.date+'</em><i class="prejl">'+o.text+'</i></li>'))
				}

				return $elm;

			},

			/*渲染每月的天数*/
			_renderDate:function(d){

				var self = this,
					$box 		= $('<div></div>'),
					$dateTime 	= this._renderDateTime(d),
					$week 		= this._renderWeek(),
					$daybox 	= $('<ul class="jt_cld_daybox"></ul>');	

				$daybox 	= this._renderDatePreDay(d,$daybox);
				$daybox 	= this._renderDateDay(d,$daybox);
				$daybox.on('click','li.js_calendar_item',function(){
					self.onHandleClick($(this))
				})

				return $box.append($dateTime,$week,$daybox)

			},

			_renderHeader:function(){

				var self = this,
					left_icon = $('<a class="jm-header-left_icon"><i class="jm-iconfont"></i></a>'),
					header = $('<header class="jm-header jm-list-header"><span>'+ops.title+'</span></header>');

				left_icon.click(function(){
					self.closeCalendar();
				})

				return header.prepend(left_icon);

			},
			_renderMessge:function(info){
				var self = this;

				/*如果页面不存在Messge DOM对象*/
				if(typeof this._$messge != 'object'){

					var	messge 		= $('<div class="calendar_messge">666</div>');

					this._$messge = messge;

					$('body').append(messge);

				}
				
				if(typeof info != 'undefined'){

					this._$messge.text(info).addClass('calendar_messge_show');

					clearTimeout(this._messgeTimer);

					this._messgeTimer = setTimeout(function(){

						self._$messge.removeClass('calendar_messge_show');

					},3000)

				}

				

			},

			renderCalendar:function(){

				if($('#_Calendar').length != 0)return;

				var d 			= this._dateObjToJson(),
					monthNumber = ops.monthNumber,
					$cldunit 	= $('<section id="_Calendar" class="jt_cldunit"></section>');

				$cldunit.append(this._renderHeader())
				this._$elm = $cldunit;

				do{
					$cldunit.append(this._renderDate(d));
					if(++d.month == 12){
						d.year++;
						d.month=0;
					}
				}while(--monthNumber != 0);

				$('body').append($cldunit);
				if(ops.inTime){this._renderMessge('选择入店日期');}

			},

			/*当日历被点击*/
			onHandleClick:function($doc){
				
				if( (!$doc.hasClass('js_invalid') ) ){

					var cache 		= this._cache,
						callback 	= {},
						nowTimeVal 	= new Date($doc.data('date')).valueOf();

					/*第一次点击*/
					if(ops.inTime){

						if(cache.clickNum === 0){

							cache.cacheInTimeVal = nowTimeVal;

							cache.clickNum++;
						}

						/*第二次点击*/
						if(cache.clickNum === 1){

							/*如果当前选择的日期小于入住日期*/
							if(nowTimeVal <= cache.cacheInTimeVal){

								cache.cacheInTimeVal = nowTimeVal;

								this._$elm.find('.jt_choose-day').removeClass('jt_choose-day').find('.prejl').text('');

								$doc.addClass('jt_choose-day').find('.prejl').text('入住');

								cache.clickNum = 1;

								this._renderMessge('选择退房日期')

								return;

							}

							if(this._getTimesDay(cache.cacheInTimeVal,nowTimeVal) < ops.minDay){

								this._renderMessge('此酒店至少住'+ops.minDay+'天')

								cache.clickNum = 1;

								return;
							}

							var _inTime 	= this._dateObjToJson(cache.cacheInTimeVal).dateStr,
								_outTime 	= this._dateObjToJson(nowTimeVal).dateStr,
								_totTime 	= this._getTimesDay(_inTime,_outTime);

							ops.$elm.data('inTime',_inTime);

							ops.$elm.data('outTime',_outTime);

							ops.$elm.data('totTime',_totTime);

							cache.clickNum = 0;

						}
						
						callback = {
							inTime 		: this._dateObjToJson(new Date(_inTime),true),
							outTime 	: this._dateObjToJson(new Date(_outTime),true),
							totTime 	: _totTime
						}

						this._$messge.removeClass('calendar_messge_show');

					}else{
						var date = $doc.data('date');
						ops.$elm.val(date)
						callback = this._dateObjToJson(new Date(date))
					}
					

					ops.onClick(ops.$elm,callback);

					this.closeCalendar();

				}
			},

			/*关闭日历*/
			closeCalendar:function(){

				var Calendar = this._$elm;
					Calendar.addClass('jt_calendar_close');

				setTimeout(function(){
					Calendar.remove();
				},300)

			},

			/*显示日历*/
			showCalendar:function(){

				ops.inTime 	= ops.$elm.data('inTime');

				ops.outTime = ops.$elm.data('outTime');

				ops.inTimeVal 	= this._strToDateObj(ops.inTime).valueOf();

				ops.outTimeVal 	= this._strToDateObj(ops.outTime).valueOf();

				this.renderCalendar();

			},

			bindDate:function(){

				if(ops.inTime){

					ops.$elm.data('inTime',ops.inTime);

					ops.$elm.data('outTime',ops.outTime);

					ops.$elm.data('totTime',this._getTimesDay(ops.inTime,ops.outTime));

				}

			},

			init:function(){

				this._checkOps();

				this.bindDate();

			}

		}

		JT.init();

		return JT;

	}

})(Zepto)