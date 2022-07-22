<template>
	<view>
		<image src="../../static/logo-2.png" mode="widthFix" class="logo"></image>
		<view class="register-container">
			<input type="text" class="register-code" maxlength="6" placeholder="请输入注册码" v-model="registerCode" />
			<view class="register-desc">管理员创建员工证账号之后，你可以从你的个人邮箱中获得注册邀请码</view>
			<button class="register-btn" open-type="getUserInfo" @tap="register()">注册</button>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			registerCode: '',
			code: null
		};
	},
	methods: {
		register() {
			// 验证注册码
			let self = this;
			// console.log(self);
			let registerCode = self.registerCode;
			if (registerCode == null || registerCode.length == 0) {
				uni.showToast({
					icon: 'none',
					title: '邀请码不能为空'
				});
				return;
			}
			if (/^[0-9]{6}$/.test(registerCode) == false) {
				uni.showToast({
					icon: 'none',
					title: '邀请码必须为6位数字'
				});
				return;
			}

			uni.login({
				provider: 'weixin',
				success(resp) {
					self.code = resp.code; // 微信临时授权码
				}
			});
			uni.getUserProfile({
				desc: '获取用户信息',
				success(resp) {
					let data = { 
							code : self.code, 
							nickname: resp.userInfo.nickName, 
							photo: resp.userInfo.avatarUrl, 
							registerCode: self.registerCode
						};
					self.ajax(self.url.register, 'POST', data, resp => {
						// 将响应的 permission 字符串保存
						let permission = resp.data.permission;
						uni.setStorageSync('token', resp.data.token);
						uni.setStorageSync('permission', resp.data.permission);
						// 跳转到 index 页面
						uni.switchTab({
							url: '../index/index'
						});
					});
				}
			});
		}
	}
};
</script>

<style lang="less">
@import url('register.less');
</style>
