<template>
	<view class="page">
		<!-- 轮播图 -->
		<swiper autoplay="true" circular="true" interval="5000" duration="1000" class="swiper">
			<swiper-item><image mode="widthFix" src="https://emos-static.oss-cn-hangzhou.aliyuncs.com/img/banner/swiper-1.jpg"></image></swiper-item>
			<swiper-item><image mode="widthFix" src="https://emos-static.oss-cn-hangzhou.aliyuncs.com/img/banner/swiper-2.jpg"></image></swiper-item>
			<swiper-item><image mode="widthFix" src="https://emos-static.oss-cn-hangzhou.aliyuncs.com/img/banner/swiper-3.jpg"></image></swiper-item>
			<swiper-item><image mode="widthFix" src="https://emos-static.oss-cn-hangzhou.aliyuncs.com/img/banner/swiper-4.jpg"></image></swiper-item>
			<swiper-item><image mode="widthFix" src="https://emos-static.oss-cn-hangzhou.aliyuncs.com/img/banner/swiper-5.jpg"></image></swiper-item>
		</swiper>
		<!-- 通知栏 -->
		<view class="notify-container" @tap="toPage('消息列表', '../message_list/message_list')">
			<view class="notify-title">
				<image src="../../static/icon-1.png" mode="widthFix" class="notify-icon"></image>
				消息提醒
			</view>
			<view class="notify-content">你有{{ unreadCount }}条未读消息</view>
			<image src="../../static/icon-2.png" mode="widthFix" class="more-icon"></image>
		</view>
		<!-- 栏目导航 -->
		<view class="nav-container">
			<view class="nav-row">
				<view class="nav" @tap="toPage('在线签到', '../../checkin/checkin')">
					<image src="../../static/nav-1.png" mode="widthFix" class="icon"></image>
					<text class="name">在线签到</text>
				</view>
				<view class="nav">
					<image src="../../static/nav-2.png" mode="widthFix" class="icon"></image>
					<text class="name">员工健康</text>
				</view>
				<view class="nav">
					<image src="../../static/nav-3.png" mode="widthFix" class="icon"></image>
					<text class="name">在线请假</text>
				</view>
				<view class="nav">
					<image src="../../static/nav-4.png" mode="widthFix" class="icon"></image>
					<text class="name">公务出差</text>
				</view>
			</view>
			<view class="nav-row">
				<view class="nav">
					<image src="../../static/nav-5.png" mode="widthFix" class="icon"></image>
					<text class="name">员工日报</text>
				</view>
				<view class="nav">
					<image src="../../static/nav-6.png" mode="widthFix" class="icon"></image>
					<text class="name">我的加班</text>
				</view>
				<view class="nav">
					<image src="../../static/nav-7.png" mode="widthFix" class="icon"></image>
					<text class="name">付款申请</text>
				</view>
				<view class="nav">
					<image src="../../static/nav-8.png" mode="widthFix" class="icon"></image>
					<text class="name">费用报销</text>
				</view>
			</view>
			<view class="nav-row">
				<view class="nav">
					<image src="../../static/nav-9.png" mode="widthFix" class="icon"></image>
					<text class="name">公告通知</text>
				</view>
				<view class="nav" @tap="toPage('在线审批', '../../approval/approval_list')">
					<image src="../../static/nav-10.png" mode="widthFix" class="icon"></image>
					<text class="name">在线审批</text>
				</view>
				<view class="nav">
					<image src="../../static/nav-11.png" mode="widthFix" class="icon"></image>
					<text class="name">物品领用</text>
				</view>
				<view class="nav">
					<image src="../../static/nav-12.png" mode="widthFix" class="icon"></image>
					<text class="name">采购申请</text>
				</view>
			</view>
		</view>
		<view class="calendar-container"><uni-calendar :insert="true" :lunar="true" :selected="calendar" @monthSwitch="changeMonth" />
		</view>
		<view class="meeting-container" v-for="one in meetingList" :key="one.id">
			<view class="meeting">
				<view class="row">
					<text class="title">{{ one.title }}</text>
					<text class="hours">时长：{{ one.duration }}</text>
				</view>
				<view class="row">
					<image src="../../static/icon-3.png" mode="widthFix" class="icon"></image>
					<text class="desc" space="emsp">日期：{{ one.date }} {{ one.start }}</text>
				</view>
				<view class="row">
					<image src="../../static/icon-4.png" mode="widthFix" class="icon"></image>
					<text class="desc">地点：{{ one.type == '在线会议' ? one.type : one.place }}</text>
				</view>
				<image :src="one.photo" class="photo"></image>
			</view>
		</view>
		<view class="message-container">
			<uni-popup ref="popupMsg" type="message">
				<uni-popup-message type="success" :message="'接收到' + latestCount + ' 条新消息'" :duration="2000"></uni-popup-message>
			</uni-popup>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			latestCount: 0,
			unreadCount: 0,
			timer: null,
			calendar: [{ date: '2021-02-15', info: '会议' }, { date: '2021-02-16', info: '会议' }, { date: '2021-02-17', info: '会议' }],
			meetingPage: 1,
			meetingLength: 20,
			meetingList: [],
			isMeetingLastPage: false,
			selectedYear: 0,
			selectedMonth: 0,
		};
	},
	onLoad() {
		let self = this;
		uni.$on('openMsg', function() {
			self.$refs.popupMsg.open();
		});
		this.refreshMessage();
	},
	onUnload() {
		uni.$off('openMsg');
	},
	onShow() {
		//console.log('onshow');
		// console.log(this.refreshMessage);
		this.calendar = [];
		this.meetingList = [];
		this.meetingPage = 1;
		this.meetingLength = 3;
		this.isMeetingLastPage = false;
		let now = new Date();
		this.selectedYear = now.getFullYear();
		this.selectedMonth = now.getMonth() + 1;
		this.getMeetingDates(this);
		this.getMeetings(this);
		
		this.timer = setInterval(this.refreshMessage, 5000);
	},
	onHide() {
		clearInterval(this.timer);
	},
	onReachBottom(e) {
		if(this.isMeetingLastPage) {
			return;
		}
		this.meetingPage += 1;
		this.getMeetings(this);
	},
	methods: {
		toPage(name, url) {
			console.log(url);
			// TODO 前端权限验证
			let hasPermission = true;
			if (name == '在线审批') {
				hasPermission = this.checkPermission(['WORKFLOW:APPROVAL']);
			}

			if (hasPermission) {
				// 跳转到指定页面
				uni.navigateTo({
					url: url
				});
			} else {
				uni.showToast({
					title: '您不具备' + name + '相关权限',
					icon: 'none'
				});
			}
		},
		refreshMessage() {
			let self = this;
			this.ajax(this.url.refreshMessage, 'GET', null, function(resp) {
				self.latestCount = resp.data.latestCount;
				self.unreadCount = resp.data.unreadCount;
				if (self.latestCount && self.latestCount > 0) {
					uni.$emit('openMsg');
				}
			});
		},
		changeMonth(e) {
			console.log('changeMonth');
			this.calendar = [];
			this.meetingList = [];
			this.meetingPage = 1;
			this.meetingLength = 3;
			this.isMeetingLastPage = false;
			this.selectedYear = e.year;
			this.selectedMonth = e.month;
			this.getMeetingDates(this);
			this.getMeetings(this);
		},
		getMeetingDates(self) {
			let data = {
				year: self.selectedYear,
				month: self.selectedMonth,
			}
			self.ajax(self.url.getUserMeetingDatesInMonth, 'POST', data, (resp) => {
				if(resp.data.code == 200) {
					let res = resp.data.result;
					for(let date of res) {
						self.calendar.push({
							date: date,
							info: '会议'
						})
					}
				} else {
					uni.showToast({
						title: resp.data.msg,
						icon: 'error'
					})
				}
			})
		},
		getMeetings(self) {
			// 校验
			let data = {
				year: self.selectedYear,
				month: self.selectedMonth,
				page: self.meetingPage,
				limit: self.meetingLength
			};
			//console.log(data);
			self.ajax(self.url.meetingPageByUserIdAndDate, 'POST', data, (resp) => {
				if(resp.data.code == 200) {
					let res = resp.data.result;
					//console.log('meetings: ', res);
					if(res == null || res.length == 0) {
						uni.showToast({
							title: '已经到底了',
							icon: 'none'
						});
						self.isMeetingLastPage = true;
						self.meetingPage = self.meetingPage <= 1 ? self.meetingPage : self.meetingPage - 1;
					} else {
						self.meetingList = self.meetingList.concat(res);
					}
				} else {
					uni.showToast({
						title: resp.data.msg,
						icon: 'error'
					})
				}
			});
		}
	}
};
</script>

<style lang="less">
@import url('index.less');
</style>
