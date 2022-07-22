<template>
	<view class="page" v-if="checkPermission(['ROOT', 'ROLE:SELECT'])">
		<view v-for="one in list" :key="one.moduleId">
			<view class="list-title">{{ one.moduleName }}</view>
			<uni-list v-if="one.action.length > 0">
				<uni-list-item
					v-for="action in one.action"
					:title="action.actionName"
					:key="action.permissionId"
					:show-switch="true"
					:switchChecked="action.selected"
					@switchChange="switchChange(action.permissionId)"
					:dataId="action.permissionId"
					:disabled="action.acquiescent"
				></uni-list-item>
			</uni-list>
		</view>
		<button class="btn" @tap="saveOrUpdate" v-if="checkPermission(['ROOT', 'ROLE:INSERT', 'ROLE:UPDATE'])">保存</button>
	</view>
</template>

<script>
export default {
	data() {
		return {
			opt: null, //URL传参，insert代表新增，edit代表修改
			roleId: null, // URL 传参，
			roleName: null, //URL传参，如果opt是edit，需要根据角色名字查找该角色的权限
			list: [],
			selected: []
		};
	},
	onLoad(options) {
		console.log(options);
		this.opt = options.opt;
		if (options.hasOwnProperty('roleName')) {
			this.roleName = options.roleName;
		}
		if (options.hasOwnProperty('roleId')) {
			this.roleId = options.roleId;
		}
	},
	onShow() {
		this.list = [];
		this.selected = [];
		let url = null;
		let method = null;
		if (this.opt == 'insert') {
			url = this.url.getAllPermission;
			method = 'GET';
		} else if (this.opt == 'edit') {
			let roleId = this.roleId;
			if (!roleId) {
				uni.showToast({
					complete: '无法修改角色权限，未知的角色id',
					icon: 'error'
				});
				return;
			}
			url = this.url.getRoleOwnPermission + '?roleId=' + roleId;
			method = 'GET';
		} else {
			console.log('TODO 其它操作');
		}

		this.ajax(url, 'GET', null, resp => {
			if (resp.data.code == 200) {
				let res = resp.data.result;
				this.list = res;
				for (let one of this.list) {
					for (let action of one.action) {
						if (action.selected) {
							this.selected.push(action.permissionId);
						}
					}
				}
			} else {
				uni.showToast({
					title: resp.data.msg,
					icon: 'error'
				});
			}
		});
	},
	methods: {
		switchChange(permissionId) {
			let index = this.selected.indexOf(permissionId);
			if (index == -1) {
				this.selected.push(permissionId);
			} else {
				this.selected.splice(index, 1);
			}
			console.log(this.selected);
		},
		saveOrUpdate() {
			let url = null;
			let data = null;
			if (this.opt == 'insert') {
				if (!this.roleName) {
					uni.showToast({
						title: '保存失败, 角色名不能为空',
						icon: 'error'
					});
					return;
				}
				url = this.url.saveRole;
				data = {
					roleName: this.roleName,
					permissions: this.selected
				};
			} else if (this.opt == 'edit') {
				if (!this.roleId) {
					uni.showToast({
						title: '更新失败, 未知的角色ID',
						icon: 'error'
					});
					return;
				}
				url = this.url.updateRole;
				data = {
					id: this.roleId,
					permissions: this.selected
				};
			}
			console.log('data', data);
			this.ajax(url, 'POST', data, resp => {
				if(resp.data.code) {
					uni.showToast({
						icon: 'success',
						title: '保存成功',
						complete: function() {
							setTimeout(function() {
								uni.navigateBack({
									delta: 1
								});
							}, 2000);
						}
					});
				} else {
					uni.showToast({
						title: resp.data.msg,
						icon: 'error'
					})
				}
				
			});
		}
	}
};
</script>

<style lang="less">
@import url('role.less');
</style>
