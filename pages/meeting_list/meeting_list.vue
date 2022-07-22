<template>
	<view class="page">
		<image class="logo" src="../../static/logo-3.jpg" mode="widthFix"></image>
		<view class="add" v-if="checkPermission(['ROOT', 'MEETING:INSERT'])" @tap="toMeetingDetailPage(null, 'insert')">
			<image class="icon" src="../../static/icon-17.png" mode="widthFix"></image>
			<text>创建会议</text>
		</view>
		<view class="list-container">
			<uni-collapse accordion ref="collapseView" @change="switchPanel">
				<uni-collapse-item v-for="(group, index) in groups" :key="group.date" :name="index" :title="group.date" thumb="../../../../static/icon-9.png">
					<scroll-view lower-threshold="100" scroll-y="true" @scrolltolower="onPanelBottom(index)">
						<view class="item" v-for="meeting in group.meetings" :key="meeting.id" @longpress="deleteMeetingById(index, meeting.id, meeting.date, meeting.start)">
							<view class="header">
								<view class="left">
									<image v-if="meeting.type == '在线会议'" src="../../static/icon-11.png" mode="widthFix" class="icon"></image>
									<image v-if="meeting.type == '线下会议'" src="../../static/icon-12.png" mode="widthFix" class="icon"></image>
									<text>{{ meeting.type }}</text>
									<text :class="meeting.status == '未开始' ? 'blue' : 'red'">（{{ meeting.status }}）</text>
								</view>
								<view class="right" v-if="checkPermission(['ROOT', 'MEETING:UPDATE']) && meeting.status == '未开始'" @tap="toMeetingDetailPage(meeting.id, 'edit')">
									<text>编辑</text>
								</view>
							</view>
							<view class="content">
								<view class="title">{{ meeting.title }}</view>
								<view class="attr">
									<view class="timer">
										<image src="../../static/icon-14.png" mode="widthFix" class="icon"></image>
										<text>{{ meeting.start }} ~ {{ meeting.end }}</text>
									</view>
									<view class="creator">
										<image src="../../static/icon-15.png" mode="widthFix" class="icon"></image>
										<text>{{ meeting.name }}</text>
									</view>
									<view class="creator">
										<image src="../../static/bar-5-active.png" mode="widthFix" class="icon"></image>
										<text>{{ meeting.num }}人</text>
									</view>
									<view class="place" v-if="meeting.type == '线下会议'">
										<image src="../../static/icon-16.png" mode="widthFix" class="icon"></image>
										<text>{{ meeting.place }}</text>
									</view>
								</view>
								<view class="desc">{{ meeting.desc }}</view>
								<button class="btn" v-if="meeting.type == '在线会议'" @tap="enter(meeting)">进入</button>
							</view>
						</view>
					</scroll-view>
				</uni-collapse-item>
			</uni-collapse>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			gPage: 0, // 分组的页码，初始值为 0 因为在 getGroupPage 方法中，每次都会有 gPage += 1
			gLimit: 8, // 分组每页显示数量
			gIsLast: false, // 是否为最后一组
			mLimit: 5, // 会议记录每页显示数
			groups: [] // 数据
		};
	},
	// 显示会议列表页面时
	onShow() {
		// 初始化
		this.gPage = 0;
		this.gLimit = 8;
		this.gIsLast = false;
		this.groups = [];
		// 日期分组查询
		this.getGroupPage(this);
	},
	// 会议列表触底时
	onReachBottom() {
		this.getGroupPage(this);
	},
	methods: {
		// 点击日期分组时
		switchPanel(index) {
			if (Number.isInteger(index)) {
				// 打开面板时 index 为数字索引。
				console.log('打开折叠面板[' + this.groups[index].date + ']');
				for (let group of this.groups) {
					group.page = 0; // 初始值为0，因为在 getMeetings 方法中每次都有 group.page += 1
					group.isLast = false;
					group.meetings = [];
				}
				this.getMeetings(this, index);
			}
		},
		// 下滑会议记录触底（到达折叠面板底部）
		onPanelBottom(index) {
			this.getMeetings(this, index);
		},
		// 分页获取会议分组（以日期分组）
		getGroupPage(self) {
			if (self.gIsLast) {
				return; // 没有更多，已经到底了
			}
			self.gPage += 1;
			let data = {
				page: self.gPage,
				limit: self.gLimit
			};
			self.ajax(self.url.groupPageByDate, 'POST', data, resp => {
				if (resp.data.code == 200) {
					let res = resp.data.result;
					// console.log(res);
					if (res == null || res.length == 0) {
						self.gIsLast = true;
						self.gPage = self.gPage > 1 ? self.gPage - 1 : 1;
						uni.showToast({
							title: '没有更多会议分组了',
							icon: 'none'
						});
					} else {
						if (self.gPage > 1) {
							uni.showToast({
								title: '加载了' + res.length + '个会议分组',
								icon: 'none'
							});
						}
						self.groups = self.groups.concat(res);
					}
				} else {
					uni.showToast({
						title: resp.data.msg,
						icon: 'none'
					});
				}
			});
		},
		// 分页获取指定分组下的会议记录
		getMeetings(self, index) {
			let group = self.groups[index];
			if (group.isLast) {
				return; // 没有更多，已经到底了
			}
			group.page += 1;
			let data = {
				date: group.date.replaceAll(/[年,月,日]/g, '-').substring(0, group.date.length - 1),
				page: group.page,
				limit: self.mLimit
			};
			self.ajax(self.url.meetingPage, 'POST', data, resp => {
				if (resp.data.code == 200) {
					let res = resp.data.result;
					console.log(res);
					if (res == null || res.meetings == null || res.meetings.length == 0) {
						group.isLast = true;
						group.page = group.page > 1 ? group.page - 1 : 1;
						uni.showToast({
							title: '当前分组没有更多会议记录',
							icon: 'none'
						});
					} else {
						if (group.page > 1) {
							uni.showToast({
								title: '加载了' + res.length + '条会议记录',
								icon: 'none'
							});
						}
						group.isLast = res.isLast;
						group.page = res.page;
						group.meetings = group.meetings.concat(res.meetings);
					}
				} else {
					uni.showToast({
						title: resp.data.msg,
						icon: 'none'
					});
				}
			});
		},
		toMeetingDetailPage(meetingId, opt) {
			uni.navigateTo({
				//url: '../meeting_detail/meeting_detail?id=' + meetingId + '&opt=' + opt
				url: '../../meeting/meeting_detail?id=' + meetingId + '&opt=' + opt
			});
		},
		deleteMeetingById(groupIndex, id, date, start) {
			let self = this;
			let group = self.groups[groupIndex];
			let now = new Date();
			let meetingStartDateTime = new Date(date + ' ' + start + ':00');
			if (now.getTime() >= meetingStartDateTime.getTime() - 20 * 60 * 1000) {
				uni.showToast({
					title: '该会议无法删除',
					icon: 'none'
				});
				return;
			}

			uni.vibrateShort({});
			uni.showModal({
				title: '提示信息',
				content: '是否删除指定会议？',
				success(resp) {
					if (resp.confirm) {
						self.ajax(self.url.deleteMeetingById, 'POST', { id }, function(resp) {
							if (resp.data.code == 200) {
								uni.showToast({
									icon: 'success',
									title: resp.data.msg,
									complete() {
										setTimeout(function() {
											group.page = 0;
											group.isLast = false;
											group.meetings = [];
											self.getMeetings(self, groupIndex);
										}, 2000);
									}
								});
							}
						});
					}
				}
			});
		},
		enter(meeting) {
			console.log(meeting);
			let startDateTime = new Date(meeting.date + ' ' + meeting.start + ':00');
			let now = new Date();
			let url = this.url.getRoomIdByUUID + '?uuid=' + meeting.uuid;

			if (now >= startDateTime - 10 * 60 * 1000) {
				this.ajax(url, 'GET', null, resp => {
					console.log(resp);
					let roomId = resp.data.result;
					if (roomId) {
						uni.navigateTo({
							url: '../../meeting/video_meeting?id=' + meeting.id + '&roomId=' + roomId
						});
					}
				});
			} else {
				uni.showToast({
					title: '距离会议开始大于10分钟，无法进入会议',
					icon: 'none'
				});
			}
		}
	}
};
</script>

<style lang="less">
@import url('meeting_list.less');
</style>
