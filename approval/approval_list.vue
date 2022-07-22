<template>
	<view class="page" v-if="checkPermission(['WORKFLOW:APPROVAL'])">
		<uni-segmented-control :current="current" :values="items" @clickItem="onClickItem" style-type="button" active-color="#3474FF" />
		<!--第一个选项卡-->
		<view v-if="current == 0" class="list">
			<view class="item" v-for="one in list" :key="one.id">
				<view class="left">
					<image :src="one.photo" mode="widthFix" class="photo"></image>
					<view class="name">{{ one.name }}</view>
					<view class="desc">（发起）</view>
				</view>
				<view class="center">
					<view class="title">{{ one.sameDept ? '本部门' : '跨部门' }}{{ one.type }}申请</view>
					<view class="attr">日期：{{ one.date }}</view>
					<view class="attr">时长：{{ one.hours >= 1 ? one.hours : '小于1' }}小时</view>
					<view class="status">状态：待审批</view>
				</view>
				<view class="right"><button class="btn" @tap="toApprivalPage(one)">审批</button></view>
			</view>
		</view>
		<!-- 第二个选项卡 -->
		<view v-if="current == 1" class="list">
			<view class="item" v-for="one in list" :key="one.id" @tap="toPage(one.processType, one.id, null)">
				<view class="left">
					<image :src="one.photo" mode="widthFix" class="photo"></image>
					<view class="name">{{ one.name }}</view>
					<view class="desc">（发起）</view>
				</view>
				<view class="center">
					<view class="title">{{ one.sameDept ? '本部门' : '跨部门' }}{{ one.type }}申请</view>
					<view class="attr">日期：{{ one.date }}</view>
					<view class="attr">时长：{{ one.hours >= 1 ? one.hours : '小于1' }}小时</view>
					<view class="attr">
						本人审批：
						<text :class="{ green: one.result_1 == '同意', red: one.result_1 == '不同意' }">{{ one.result_1 }}</text>
					</view>
					<view class="attr">
						最终结果：
						<text class="result" v-if="one.result_2 == null">等待中</text>
						<text v-if="one.result_2 != null" :class="{ green: one.result_2 == '同意', red: one.result_2 == '不同意' }">{{ one.result_2 }}</text>
					</view>
				</view>
				<view class="right">
					<block v-if="one.processStatus == '已结束'">
						<image :src="one.lastUserPhoto" mode="widthFix" class="icon"></image>
						<view class="name">{{ one.lastUserName }}</view>
						<view class="desc">（终审）</view>
					</block>
					<block v-if="one.processStatus == '未结束'">
						<image src="../static/icon-20.png" mode="widthFix" class="icon"></image>
						<view class="desc">审批进行中</view>
					</block>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			page: 1,
			length: 20,
			list: [],
			isLastPage: false,
			items: ['待审批', '已审批'],
			current: 0
		};
	},
	onShow() {
		this.page = 1;
		this.list = [];
		this.isLastPage = false;
		uni.pageScrollTo({
			scrollTop: '0'
		});
		this.loadData(this);
	},
	onReachBottom() {
		if (this.isLastPage) {
			return;
		}
		this.page += 1;
		this.loadData(this);
	},
	methods: {
		onClickItem(e) {
			if (this.current != e.currentIndex) {
				this.current = e.currentIndex;
				this.page = 1;
				this.list = [];
				this.isLastPage = false;
				this.loadData(this);
			}
		},
		loadData(self) {
			let data = {
				type: self.items[self.current],
				page: self.page,
				length: self.length,
				token: uni.getStorageSync('token'),
				code: self.code
			};
			self.ajax(self.url.searchUserTaskListByPage, 'POST', data, function(resp) {
				let result = resp.data.result;
				console.log(result);
				if (result == null || result.length == 0) {
					self.isLastPage = true;
					self.page -= 1;
					if (self.page > 1) {
						uni.showToast({
							icon: 'none',
							title: '已经到底了'
						});
					}
				}
				let ids = []; // 所有终审人的id
				for (let one of result) {
					one.type = one.type == 1 ? '在线会议' : '线下会议';
					if (self.current == 1 && one.processStatus == '已结束') {
						ids.push(Number(one.lastUser));
					}
				}
				if (self.current == 1 && ids.length > 0) {
					//查询终审人的信息
					self.ajax(self.url.getUsernameAndPhoto, 'POST', { ids }, function(resp) {
						let list = resp.data.result;
						for (let one of result) {
							for (let item of list) {
								if (one.lastUser == item.id) {
									one.lastUserName = item.name;
									one.lastUserPhoto = item.photo;
								}
							}
						}
						self.list = result;
					});
				} else {
					self.list = result;
				}
				
			});
		},
		toApprivalPage(one) {
			let url = './approval?processType=' + one.processType + '&id=' + one.id;
			if (one.taskId) {
				url += '&taskId=' + one.taskId;
			}
			uni.navigateTo({
				url: url
			});
		}
	}
};
</script>

<style lang="less">
@import url('approval_list.less');
</style>
