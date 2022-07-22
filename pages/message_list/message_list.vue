<template>
	<view class="page">
		<uni-list :border="true">
			<uni-list-chat
				v-for="one in list"
				:key="one.id"
				:title="one.senderName"
				:note="one.msg"
				:avatar="one.senderPhoto"
				badge-positon="left"
				:badge-text="one.hasRead ? '' : 'dot'"
				link="navigateTo"
				:to="'../message_detail/message_detail?refId=' + one.refId + '&sendTime=' + one.sendTime + '&msg=' + one.msg + '&hasRead=' + one.hasRead"
			>
				<view class="time-container">
					<text class="time-text">{{ one.sendTime}}</text>
				</view>
			</uni-list-chat>
		</uni-list>
	</view>
</template>

<script>
export default {
	data() {
		return {
			page: null,
			limit: null,
			isLastPage: null,
			list: []
		};
	},
	onShow() {
		this.page = 1 ;
		this.limit = 20;
		this.isLastPage = false;
		uni.pageScrollTo({
			scrollTop: 0
		})
		this.messagePage(this);
	},
	onReachBottom() {
		if (this.isLastPage) {
			uni.showToast({
				title: '以到达底部',
				icon: 'none'
			});
			return;
		}
		this.page += 1;
		this.messagePage(this);
	},
	methods: {
		// 分页查询函数
		messagePage(self) {
			self.ajax(self.url.messagePage, 'POST', { page: self.page, limit: self.limit }, function(resp) {
				let res = resp.data.result;
				if (res == null || res.length == 0) {
					self.isLastPage = true;
					self.page = self.page > 1 ? self.page - 1 : 1;
					uni.showToast({
						title: '以到达底部',
						icon: 'none'
					});
				} else {
					if (self.page <= 1) {
						self.list = [];
					} else {
						uni.showToast({
							title: '加载了' + self.limit + '条消息',
							icon: 'none'
						})
					}
					self.list = self.list.concat(res);
				}
			});
		}
	}
};
</script>

<style lang="less">
@import url('message_list.less');
</style>
