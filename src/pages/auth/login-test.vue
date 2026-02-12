<script lang="ts" setup>
import { useTokenStore } from '@/store/token'

definePage({
  style: {
    navigationBarTitleText: '登录测试',
  },
  excludeLoginPath: true,
})

const tokenStore = useTokenStore()

const form = ref({
  account: '',
  password: '',
})

const loading = ref(false)
const loginResult = ref<any>(null)
const loginError = ref('')

function getLoginPayload() {
  const account = form.value.account.trim()
  if (account.includes('@')) {
    return {
      email: account,
      password: form.value.password,
    }
  }
  return {
    username: account,
    password: form.value.password,
  }
}

async function handleLogin() {
  if (!form.value.account.trim() || !form.value.password) {
    uni.showToast({
      title: '请输入账号和密码',
      icon: 'none',
    })
    return
  }

  loginResult.value = null
  loginError.value = ''
  loading.value = true

  try {
    const res = await tokenStore.login(getLoginPayload())
    loginResult.value = res
    uni.showToast({
      title: '登录成功',
      icon: 'success',
    })
  }
  catch (error: any) {
    loginError.value = error?.message || JSON.stringify(error) || '登录失败'
    uni.showToast({
      title: '登录失败',
      icon: 'none',
    })
  }
  finally {
    loading.value = false
  }
}

function clearResult() {
  loginResult.value = null
  loginError.value = ''
}
</script>

<template>
  <view class="login-test">
    <view class="title">
      OAuth2 登录测试
    </view>

    <input
      v-model.trim="form.account"
      class="input"
      placeholder="用户名或邮箱"
      placeholder-class="placeholder"
    >
    <input
      v-model="form.password"
      class="input"
      type="password"
      password
      placeholder="密码"
      placeholder-class="placeholder"
    >

    <button class="btn primary" :loading="loading" @click="handleLogin">
      测试登录
    </button>
    <button class="btn" @click="clearResult">
      清空结果
    </button>

    <view v-if="loginError" class="panel error">
      {{ loginError }}
    </view>
    <view v-if="loginResult" class="panel">
      <text selectable>
        {{ JSON.stringify(loginResult, null, 2) }}
      </text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.login-test {
  min-height: 100vh;
  padding: 32rpx;
  background: #f7f8fa;
}

.title {
  margin-bottom: 24rpx;
  font-size: 34rpx;
  font-weight: 700;
  color: #1f2937;
}

.input {
  height: 88rpx;
  margin-bottom: 20rpx;
  padding: 0 24rpx;
  border-radius: 12rpx;
  background: #fff;
  font-size: 28rpx;
}

.placeholder {
  color: #9ca3af;
}

.btn {
  margin-top: 12rpx;
  border-radius: 12rpx;
}

.primary {
  background: #2563eb;
  color: #fff;
}

.panel {
  margin-top: 24rpx;
  padding: 20rpx;
  border-radius: 12rpx;
  background: #fff;
  font-size: 24rpx;
  line-height: 1.6;
  word-break: break-all;
}

.error {
  color: #dc2626;
}
</style>
