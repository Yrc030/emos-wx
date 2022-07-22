<template>
	<view class="page" v-if="checkPermission(['WORKFLOW:APPROVAL'])">
		<view class="meeting" v-if="processType == 'meeting'">
			<view class="header">{{ title }}</view>
			<view class="attr">
				<view class="list">
					<view class="item">
						<view class="key">日期</view>
						<text class="value">{{ date }}</text>
					</view>
					<view class="item">
						<view class="key">开始时间</view>
						<text class="value">{{ start }}</text>
					</view>
					<view class="item">
						<view class="key">结束时间</view>
						<text class="value">{{ end }}</text>
					</view>
					<view class="item">
						<view class="key">会议类型</view>
						<text class="value">{{ typeArray[typeIndex] }}</text>
					</view>
					<view class="item" v-if="typeArray[typeIndex] == '线下会议'">
						<view class="key">地点</view>
						<view class="value">{{ place }}</view>
					</view>
				</view>
				<view>
					<text class="desc">{{ desc }}</text>
				</view>
			</view>
			<view class="members">
				<view class="number">参会者（{{ members.length }}人）</view>
				<view class="member">
					<view class="user" v-for="one in members" :key="one.id">
						<image :src="one.photo" mode="widthFix" class="photo"></image>
						<text class="name">{{ one.name }}</text>
					</view>
				</view>
			</view>
			<block v-if="taskId != null">
				<button class="btn" @tap="approvalMeeting('同意')" type="primary">同意</button>
				<button class="btn" @tap="approvalMeeting('不同意')" type="warn">不同意</button>
			</block>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			processType: null,
			taskId: null,
			id: null,
			uuid: null,
			title: '',
			date: '',
			start: '',
			end: '',
			typeArray: ['在线会议', '线下会议'],
			typeIndex: 0,
			place: '',
			desc: '',
			members: []
		};
	},
	onLoad(options) {
		this.processType = options.processType;
		this.id = options.id;
		if (options.hasOwnProperty('taskId')) {
			this.taskId = options.taskId;
		}
	},
	onShow() {
		if (this.processType == 'meeting') {
			this.getMeetingDetail(this);
		}
	},
	methods: {
		getMeetingDetail(self) {
			let url = self.url.getMeetingDetailById + '?id=' + self.id;
			self.ajax(url, 'GET', null, function(resp) {
				if (resp.data.code == 200) {
					let res = resp.data.result;
					self.uuid = res.uuid;
					self.title = res.title;
					self.date = res.date;
					self.start = res.start;
					self.end = res.end;
					self.typeIndex = res.type - 1;
					self.place = res.place;
					self.desc = res.desc;
					self.members = res.members;
				} else {
					uni.showToast({
						title: resp.data.msg,
						icon: 'none'
					});
				}
			});
		},
		approvalMeeting(approval) {
			let self = this;
			uni.showModal({
				title: '提示消息',
				content: '您确定' + approval + '这条申请？',
				success(resp) {
					if (resp.confirm) {
						if (self.taskId != null && self.taskId != '') {
							let data = {
								taskId: self.taskId,
								approval: approval,
							};
							console.log(data);
							self.ajax(self.url.approvalMeeting, 'POST', data, function(resp) {
								uni.showToast({
									title: '处理完成',
									icon: 'success',
									complete() {
										setTimeout(()=> {
											uni.navigateBack({
												delta: 1
											})
										}, 2000)
									}
								})
							});
						} else {
							uni.showToast({
								title: '未指定taskId',
								icon: 'error'
							});
						}
					}
				}
			});
		}
	}
};
</script>

<style lang="less">
@import url('approval.less');
</style>
