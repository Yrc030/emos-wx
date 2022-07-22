<template>
	<view class="page" v-if="checkPermission(permission, ['ROOT', 'DEPT:SELECT'])">
		<view class="list">
			<view class="item" v-for="one in list" :key="one.id" @longpress="deleteDept(one.id, one.deptName)">
				<text class="key">{{ one.deptName }}</text>
				<text class="value" @tap="updateDept(one.id, one.deptName)" v-if="checkPermission(permission, ['ROOT', 'DEPT:UPDATE'])">修改</text>
			</view>
		</view>
		<button class="btn" @tap="insertDept" v-if="checkPermission(permission, ['ROOT', 'DEPT:INSERT'])">添加</button>
		<uni-popup ref="popupDept" type="dialog">
			<uni-popup-dialog mode="input" title="编辑部门名称" :value="deptName" placeholder="输入部门名称" @confirm="finishDept"></uni-popup-dialog>
		</uni-popup>
	</view>
</template>

<script>
export default {
	data() {
		return {
			list: [],
			deptId: 0,
			deptName: '',
			opt: '',
			permission: uni.getStorageSync('permission')
		};
	},
	onShow() {
		this.deptId = null;
		this.list = [];
		this.getAllDept(this);
	},
	methods: {
		getAllDept(self) {
			self.ajax(self.url.getAllDept, 'GET', null, resp => {
				self.list = resp.data.result;
			});
		},
		insertDept() {
			this.deptId = null;
			this.deptName = '';
			this.opt = 'insert';
			this.$refs.popupDept.open();
		},
		updateDept(deptId, deptName) {
			this.opt = 'update';
			this.deptId = deptId;
			this.deptName = deptName;
			this.$refs.popupDept.open();
		},
		deleteDept(deptId, deptName) {
			if (!this.checkPermission(this.permission, ['ROOT', 'DEPT:DELETE'])) {
				return;
			}
			let self = this;
			uni.showModal({
				title: '提示信息',
				content: '是否删除' + deptName + '？',
				success: function(resp) {
					if (resp.confirm) {
						self.ajax(self.url.deleteDept, 'POST', { id: deptId }, (resp) => {
							uni.showToast({
								title: resp.data.msg,
								icon: resp.data.code == 200 ? 'success' : 'error',
								complete() {
									self.getAllDept(self);
								}
							});
						});
					}
				}
			});
		},
		finishDept(value) {
			let self = this;
			let flag = false;
			for (let one of self.list) {
				//对话框中输入的部门名称不能跟已有部门名称相同
				if (one.deptName == value) {
					flag = true;
					break;
				}
			}
			//部门名称必须是汉字，如果有特殊要求可以修改正则表达式
			if (!/^[\u4e00-\u9fa5]{3,15}$/.test(value)) {
				uni.showToast({
					icon: 'none',
					title: '部门名称不符合要求'
				});
			} else if (flag) {
				uni.showToast({
					icon: 'none',
					title: '部门已经存在'
				});
			} else {
				this.deptName = value;
				let url = null;
				let data = null;
				if (self.opt == 'insert') {
					url = self.url.saveDept;
				} else if (self.opt == 'update') {
					url = self.url.updateDept;
				}
				data = {
					id: self.deptId,
					deptName: self.deptName
				};
				self.ajax(url, 'POST', data, resp => {
					uni.showToast({
						title: resp.data.msg,
						icon: resp.data.code == 200 ? 'success' : 'error',
						complete() {
							self.getAllDept(self);
						}
					});
				});
			}
		}
	}
};
</script>

<style lang="less">
@import url('dept_list.less');
</style>
