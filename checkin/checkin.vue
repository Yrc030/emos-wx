<template>
	<view>
		<camera device-position="front" flash="off" class="camera" @error="error" v-if="showCamera"></camera>
		<image mode="widthFix" class="image" :src="photoPath" v-if="showImage"></image>
		<view class="operate-container">
			<button type="primary" class="btn" @tap="clickBtn" :disabled="!canCheckin">{{ btnText }}</button>
			<button type="warn" class="btn" @tap="afresh" :disabled="!canCheckin">重拍</button>
		</view>
		<view class="notice-container">
			<text class="notice">注意事项</text>
			<text class="desc">拍照签到的时候，必须要拍摄自己的正面照片，侧面照片会导致无法识别。另外，拍照的时候不要戴墨镜或者帽子，避免影响拍照签到的准确度。</text>
		</view>
	</view>
</template>

<script>
var QQMapWX = require('../lib/qqmap-wx-jssdk.min.js');
var qqmapsdk;
export default {
	data() {
		return {
			canCheckin: true,
			photoPath: '',
			btnText: '拍照',
			showCamera: true,
			showImage: false
		};
	},
	onLoad() {
		// 初始化 qqmapsdk
		qqmapsdk = new QQMapWX({
			key: 'CV6BZ-IMSEU-VH3VO-2O3UU-KO52Q-WGBGH'
		});
	},
	onShow() {
		let vm = this;
		vm.ajax(vm.url.canCheckin, 'GET', null, resp => {
			if (resp.data.msg != '允许考勤') {
				vm.canCheckin = false;
				setTimeout(() => {
					uni.showToast({
						title: resp.data.msg,
						icon: 'none'
					});
				}, 1000);
			}
		});
	},
	methods: {
		clickBtn() {
			let vm = this;
			if (vm.btnText == '拍照') {
				let ctx = uni.createCameraContext();
				ctx.takePhoto({
					quality: 'high',
					success: resp => {
						console.log(resp.tempImagePath);
						vm.photoPath = resp.tempImagePath;
						vm.btnText = '签到';
						vm.showCamera = false;
						vm.showImage = true;
					}
				});
			} else {
				// 签到功能
				// 显示加载框
				uni.showLoading({
					title: '签到中请稍后'
				});
				// setTimeout(() => {
				// 	uni.hideLoading();
				// }, 3000);
				// 获取地理坐标
				uni.authorize({
					scope: 'scope.userLocation',
					success() {
						uni.getLocation({
							type: 'wgs84',
							success(resp) {
								let latitude = resp.latitude;
								let longitude = resp.longitude;
								// 将坐标转换为详细地址信息
								qqmapsdk.reverseGeocoder({
									location: {
										latitude,
										longitude
									},
									success(resp) {
										// 获取地址字符串
										let address = resp.result.address;
										// 获取地址Json对象
										let addressComponent = resp.result.address_component;
										// 发送签到请求
										uni.uploadFile({
											url: vm.url.checkin,
											filePath: vm.photoPath,
											name: 'photo',
											header: {
												token: uni.getStorageSync('token')
											},
											formData: {
												address: address,
												country: addressComponent.nation,
												province: addressComponent.province,
												city: addressComponent.city,
												district: addressComponent.district
											},
											success(resp) {
												uni.hideLoading(); // 隐藏加载框
												if (resp.statusCode == 200) {
													let data = JSON.parse(resp.data);
													if (data.code == 200) {
														//签到成功
														uni.showToast({
															title: data.msg,
															duration: 2000,
															complete() {
																//跳转到签到结果统计页面
																uni.redirectTo({
																	url: './checkin_result'
																});
															}
														});
													} else {
														uni.showToast({
															title: data.msg,
															duration: 2000,
															icon: 'error'
														});
													}
												} else {
													// 签到失败
													if (resp.data == '不存在的人脸模型') {
														// 提示用户确认
														uni.showModal({
															title: '提示信息',
															content: 'EMOS系统中不存在你的人脸识别模型，是否用当前这张照片作为人脸识别模型？',
															success(resp) {
																if (resp.confirm) {
																	// 创建人脸模型
																	uni.uploadFile({
																		url: vm.url.createFaceModel,
																		filePath: vm.photoPath,
																		name: 'photo',
																		header: {
																			token: uni.getStorageSync('token')
																		},
																		success(resp) {
																			if (resp.statusCode == 500) {
																				uni.showToast({
																					title: resp.data,
																					duration: 2000,
																					icon: 'none'
																				});
																			} else if (resp.statusCode == 200) {
																				let data = JSON.parse(resp.data);
																				uni.showToast({
																					title: data.msg,
																					duration: 2000,
																					icon: 'none'
																				});
																			}
																		}
																	});
																}
															}
														});
													} else {
														uni.showToast({
															title: resp.data,
															icon: 'none'
														});
													}
												}
											}
										});
									},
									fail: function(error) {
										console.error(error);
									},
									complete: function(res) {
										console.log(res);
									}
								});
							},
							fail(resp) {
								console.log(resp);
								uni.showToast({
									title: '请勿重复点击签到按钮',
									duration: 2000,
									icon: 'none'
								});
							},
							complete() {
								uni.hideLoading();
							}
						});
					}
				});
			}
		},
		afresh() {
			// 重拍
			this.photoPath = '';
			this.btnText = '拍照';
			this.showCamera = true;
			this.showImage = false;
		}
	}
};
</script>

<style lang="less">
@import url('checkin.less');
</style>
