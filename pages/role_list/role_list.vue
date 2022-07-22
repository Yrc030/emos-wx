<template>
	<view class="page" v-if="checkPermission(['ROOT', 'ROLE:SELECT'])">
		<view class="list">
			<view class="item" v-for="one in list" :key="one.id" @longpress="deleteRole(one.id, one.roleName, one.systemic)" @tap="toRolePage(one.id)">
				<text class="key">{{ one.roleName }}</text>
				<image src="../../static/icon-2.png" mode="widthFix" class="icon"></image>
			</view>
		</view>
		<button class="btn" @tap="insertRole" v-if="checkPermission(['ROOT', 'ROLE:INSERT'])">添加</button>
		<uni-popup ref="popupRole" type="dialog">
			<uni-popup-dialog mode="input" title="编辑角色名称" :value="roleName" placeholder="输入角色名称" @confirm="finishRole"></uni-popup-dialog>
		</uni-popup>
	</view>
</template>

<script>
export default {
	data() {
		return {
			list: [{ id: 1, roleName: '角色A' }, { id: 2, roleName: '角色B' }, { id: 3, roleName: '角色C' }, { id: 4, roleName: '角色D' }],
			id: 0,
			roleName: ''
		};
	},
	onShow() {
		this.list = [];
		this.getAllRole(this);
	},
	methods: {
		getAllRole(self) {
			self.ajax(self.url.getAllRole, 'GET', null, resp => {
				if (resp.data.code == 200) {
					self.list = resp.data.result;
				} else {
					uni.showToast({
						title: resp.data.msg,
						icon: 'error'
					});
				}
			});
		},
		insertRole() {
			this.roleName = '';
			// 弹窗，输入角色名称
			this.$refs.popupRole.open();
		},
		finishRole(value) {
			if (!value) {
				uni.showToast({
					title: '角色名不能为空',
					icon: 'error'
				});
				return;
			}
			this.roleName = value;
			setTimeout(() => {
				uni.navigateTo({
					url: '../role/role?opt=insert&roleName=' + this.roleName
				});
			}, 1000);
		},
		toRolePage(roleId) {
			if (roleId == 0) {
				uni.showToast({
					icon: 'none',
					title: '超级管理员拥有全部权限，且无法修改'
				});
				return;
			}
			setTimeout(() => {
				uni.navigateTo({
					url: '../role/role?opt=edit&roleId=' + roleId
				});
			});
		},
		deleteRole(roleId, roleName, systemic) {
			if (!this.checkPermission(['ROOT', 'ROLE:DELETE']) || systemic) {
				// 无权限或者是内置角色，则无法删除
					return;
				}
				let self = this;
				uni.showModal({
					title: '提示信息',
					content: '是否删除' + roleName + '？',
					success: function(resp) {
						if (resp.confirm) {
							self.ajax(self.url.deleteRoleById, 'POST', { id: roleId }, function(resp) {
								uni.showToast({
									icon: resp.data.code == 200 ? 'success' : 'error',
									title: resp.data.msg,
									complete: function() {
										self.getAllRole(self);
									}
								});
							});
						}
					}
				});
		}
	}
};
</script>

<style lang="less">
@import url('role_list.less');
</style>
