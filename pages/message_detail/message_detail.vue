<template>
	<view class="page">
		<view class="header">
			<view class="time">{{ sendTime }}</view>
			<view class="delete-btn" @tap="deleteMsg">删除</view>
		</view>
		<view class="message-container">
			<text class="message">{{ msg }}</text>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			refId: 0,
			sendTime: null,
			msg: ''
		};
	},
	onLoad(op) {
		this.refId = op.refId;
		this.sendTime = op.sendTime;
		this.msg = op.msg;
		if (op.hasRead == 'false') {
			this.ajax(this.url.updateToRead + this.refId, 'POST', null, function() {
				console.log("消息更新为已读");
			});
		}
	},
	methods: {
		deleteMsg() {
			let self = this;
			uni.showModal({
				title: '提示信息',
				content: '是否删除消息？',
				success(resp) {
					if(resp.confirm) {
						self.ajax(self.url.deleteMsg + self.refId, 'POST', null, function(resp) {
							if(resp.data.code == 200) {
								uni.showToast({
									title: '删除成功',
									icon: 'none',
									complete() {
										setTimeout(() => {
											uni.navigateBack({
												delta: 1
											});
										}, 1000);
									}
								});
							} else {
								uni.showToast({
									title: resp.data.msg ,
									icon: 'none'
								});
							}
						});
					}
				}
			})
			
		}
	}
};
</script>

<style lang="less">
@import url('message_detail.less');
</style>
