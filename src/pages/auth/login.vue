<script lang="ts" setup>
import type { FormInstance, FormRules } from 'wot-design-uni/components/wd-form/types'
import { LOGIN_PAGE, REGISTER_PAGE } from '@/router/config'
import { useTokenStore } from '@/store/token'
import { isPageTabbar } from '@/tabbar/store'
import { currRoute, ensureDecodeURIComponent, HOME_PAGE } from '@/utils'

definePage({
  style: {
    navigationBarTitleText: '登录',
  },
})

const tokenStore = useTokenStore()
const formRef = ref<FormInstance>()
const form = ref({
  account: '',
  password: '',
})
const loading = ref(false)

const formRules: FormRules = {
  account: [
    {
      required: true,
      message: '请输入用户名或邮箱',
    },
  ],
  password: [
    {
      required: true,
      message: '请输入密码',
    },
  ],
}

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

function redirectAfterLogin() {
  const { query } = currRoute()
  const redirect = query.redirect ? ensureDecodeURIComponent(query.redirect) : HOME_PAGE
  const targetUrl = redirect || HOME_PAGE

  if (targetUrl === LOGIN_PAGE) {
    uni.switchTab({ url: HOME_PAGE })
    return
  }

  if (isPageTabbar(targetUrl)) {
    uni.switchTab({ url: targetUrl })
    return
  }

  uni.reLaunch({ url: targetUrl })
}

async function doLogin() {
  if (loading.value) {
    return
  }
  if (tokenStore.hasLogin) {
    redirectAfterLogin()
    return
  }
  const formResult = await formRef.value?.validate()
  if (!formResult?.valid) {
    return
  }
  try {
    loading.value = true
    await tokenStore.login(getLoginPayload())
    redirectAfterLogin()
  }
  catch (error) {
    console.log('登录失败', error)
  }
  finally {
    loading.value = false
  }
}

function goRegister() {
  uni.navigateTo({
    url: REGISTER_PAGE,
  })
}
</script>

<template>
  <view class="login-page">
    <view class="login-panel">
      <view class="login-header">
        <view class="title">
          欢迎登录
        </view>
        <view class="subtitle">
          使用用户名或邮箱继续
        </view>
      </view>

      <wd-form ref="formRef" :model="form" :rules="formRules" error-type="message">
        <wd-input
          v-model.trim="form.account"
          prop="account"
          label="账号"
          placeholder="请输入用户名或邮箱"
          clearable
          :maxlength="64"
        />
        <wd-input
          v-model="form.password"
          prop="password"
          label="密码"
          placeholder="请输入密码"
          :show-password="true"
          clearable
          @confirm="doLogin"
        />
      </wd-form>

      <wd-button block size="large" :loading="loading" @click="doLogin">
        登录
      </wd-button>

      <view class="footer">
        <text class="link" @click="goRegister">
          没有账号？去注册
        </text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  padding: 96rpx 40rpx;
  background: linear-gradient(180deg, #f6f8f6 0%, #eef9f1 100%);
}

.login-panel {
  padding: 40rpx 28rpx;
  border-radius: 24rpx;
  background: #fff;
  box-shadow: 0 12rpx 40rpx rgb(16 24 16 / 8%);
}

.login-header {
  margin-bottom: 20rpx;
}

.title {
  font-size: 44rpx;
  font-weight: 700;
  line-height: 1.3;
  color: #111921;
}

.subtitle {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #9db8a6;
}

.footer {
  margin-top: 24rpx;
  text-align: center;
}

.link {
  font-size: 24rpx;
  color: #19e65e;
}
</style>
