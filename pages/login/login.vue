<template>
	<view>
		<image src="../../static/logo-1.png" mode="widthFix" class="logo"></image>
		<view class="logo-title">EMOS在线办公系统</view>
		<view class="logo-subtitle">v1.0.0</view>
		<button class="login-btn" open-type="getUserInfo" @tap="login()">登录系统</button>
		<view class="register-container">
			没有账号
			<text class="register" @tap="toRegister()">立即注册</text>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {};
	},
	methods: {
		toRegister() {
			uni.navigateTo({
				url: '../register/register'
			});
		},
		login() {
			let self = this;
			uni.login({
				provider: 'weixin',
				success(resp) {
					//console.log(resp.code);
					self.ajax(self.url.login, 'POST', { "code": resp.code }, resp => {
						// 将响应的 permission 字符串保存
						let permission = resp.data.permission
						console.log("用户权限: ", permission);
						uni.setStorageSync('permission', permission);
						// 跳转到 index 页面
						uni.switchTab({
							url: "../index/index"
						})
					});
				},
				fail(e) {
					console.log(e);
					uni.showToast({
						icon: 'none',
						title: '执行异常'
					});
				}
			});
		}
	}
};
</script>

<style lang="less">
@import url('login.less');
</style>
