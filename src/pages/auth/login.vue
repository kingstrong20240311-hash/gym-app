<script lang="ts" setup>
import { LOGIN_PAGE, REGISTER_PAGE } from '@/router/config'
import { useTokenStore } from '@/store/token'
import { isPageTabbar } from '@/tabbar/store'
import { currRoute, ensureDecodeURIComponent, HOME_PAGE } from '@/utils'

definePage({
  style: {
    navigationStyle: 'custom',
  },
})

const tokenStore = useTokenStore()
const loginMethod = ref<'password' | 'code'>('password')
const showPassword = ref(false)
const rememberMe = ref(true)
const loading = ref(false)

const form = ref({
  account: '',
  password: '',
  code: '',
})

// Original login logic preserved
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

  // Basic validation
  if (!form.value.account) {
    uni.showToast({ title: '请输入用户名或手机号', icon: 'none' })
    return
  }
  if (loginMethod.value === 'password' && !form.value.password) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }
  if (loginMethod.value === 'code' && !form.value.code) {
    uni.showToast({ title: '请输入验证码', icon: 'none' })
    return
  }

  try {
    loading.value = true
    if (loginMethod.value === 'password') {
      await tokenStore.login(getLoginPayload())
    }
    else {
      // Logic for code login if available in tokenStore
      // await tokenStore.loginByCode({ phone: form.value.account, code: form.value.code })
      uni.showToast({ title: '验证码登录功能暂未实现', icon: 'none' })
      return
    }
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

function togglePassword() {
  showPassword.value = !showPassword.value
}

function handleSupport() {
  uni.showToast({ title: '请联系客服：400-123-4567', icon: 'none' })
}

function handleSocialLogin(type: string) {
  uni.showToast({ title: `${type}登录功能开发中`, icon: 'none' })
}
</script>

<template>
  <view
    class="dark min-h-screen flex flex-col bg-background-light text-slate-900 font-display dark:bg-background-dark dark:text-slate-100"
  >
    <!-- Status Bar Spacer -->
    <view class="h-12 w-full" />

    <!-- Header Section -->
    <view class="relative h-72 w-full flex flex-col items-center justify-center overflow-hidden">
      <view class="absolute inset-0 from-[#102216] to-[#08120b] bg-gradient-to-b" />
      <!-- Abstract Background Pattern -->
      <view class="absolute inset-0 opacity-10">
        <image
          class="h-full w-full object-cover mix-blend-overlay"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjss6JR6nDIRlk8USOC2DerQCO6K1O1AIMpFa8Qc8HoPCjwq_eLXj4WAH-hlLqauKzohAn14ydxSRViSnNPmvWAcEzv4D62_tK9qPaiAA4PRJjcyRHTY_jIsMwvmgZ4H1_yPN6Lfgp7iSDRuaRxOf2u9fJdjp4xR7h5E4TX9r4PP1XfnQFvHfKP3TExx-BZXIo4d4gjop2LMM3lIIaL5Yv1OWs2UOC7n9oMReO9ZYKEEA7ypdPU8oqVYI3AucvNjtMTrVLuOTu6pD5"
          mode="aspectFill"
        />
      </view>
      <!-- Logo and Brand -->
      <view class="relative z-10 flex flex-col items-center">
        <view
          class="mb-4 h-16 w-16 flex items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20"
        >
          <view class="i-carbon-activity text-4xl text-background-dark" />
        </view>
        <text class="mb-1 text-2xl text-white font-bold tracking-tight">私教管理系统</text>
        <text class="text-sm text-primary/70 font-medium tracking-widest uppercase">
          Security Login Center
        </text>
      </view>
    </view>

    <!-- Main Form Area -->
    <view
      class="relative z-20 flex-grow rounded-t-[2rem] bg-background-light px-8 pt-10 shadow-2xl -mt-8 dark:bg-background-dark"
    >
      <!-- Login Method Toggle -->
      <view class="mb-8 flex rounded-xl bg-primary/5 p-1 dark:bg-primary/10">
        <button
          class="flex-1 rounded-lg py-2 text-sm font-semibold transition-all !m-0 !border-none !outline-none"
          :class="
            loginMethod === 'password'
              ? 'bg-primary text-background-dark shadow-sm'
              : 'bg-transparent text-slate-500 dark:text-slate-400'
          "
          @click="loginMethod = 'password'"
        >
          密码登录
        </button>
        <button
          class="flex-1 rounded-lg py-2 text-sm font-semibold transition-all !m-0 !border-none !outline-none"
          :class="
            loginMethod === 'code'
              ? 'bg-primary text-background-dark shadow-sm'
              : 'bg-transparent text-slate-500 dark:text-slate-400'
          "
          @click="loginMethod = 'code'"
        >
          验证码登录
        </button>
      </view>

      <!-- Form Fields -->
      <view class="flex flex-col gap-5">
        <view>
          <text
            class="mb-2 ml-1 block text-xs text-slate-500 font-bold tracking-wider uppercase dark:text-primary/60"
          >
            用户名 / 手机号
          </text>
          <view class="group relative">
            <view class="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4">
              <view class="i-carbon-user text-xl text-slate-400 dark:text-slate-500" />
            </view>
            <input
              v-model="form.account"
              class="block h-12 w-full border border-slate-200 rounded-xl border-solid bg-white py-3 pl-11 pr-4 text-slate-900 outline-none transition-all dark:border-slate-700/50 dark:bg-slate-800/50 dark:text-white"
              placeholder="请输入您的账号"
              type="text"
            >
          </view>
        </view>

        <view v-if="loginMethod === 'password'">
          <text
            class="mb-2 ml-1 block text-xs text-slate-500 font-bold tracking-wider uppercase dark:text-primary/60"
          >
            登录密码
          </text>
          <view class="group relative">
            <view class="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4">
              <view class="i-carbon-locked text-xl text-slate-400 dark:text-slate-500" />
            </view>
            <input
              v-model="form.password"
              class="block h-12 w-full border border-slate-200 rounded-xl border-solid bg-white py-3 pl-11 pr-12 text-slate-900 outline-none transition-all dark:border-slate-700/50 dark:bg-slate-800/50 dark:text-white"
              placeholder="请输入密码"
              :password="!showPassword"
            >
            <view class="absolute inset-y-0 right-0 z-10 flex items-center pr-4">
              <view
                class="cursor-pointer text-slate-400 transition-colors dark:text-slate-500 hover:text-primary"
                :class="showPassword ? 'i-carbon-view' : 'i-carbon-view-off'"
                @click="togglePassword"
              />
            </view>
          </view>
        </view>

        <view v-else>
          <text
            class="mb-2 ml-1 block text-xs text-slate-500 font-bold tracking-wider uppercase dark:text-primary/60"
          >
            验证码
          </text>
          <view class="group relative">
            <view class="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4">
              <view class="i-carbon-chat text-xl text-slate-400 dark:text-slate-500" />
            </view>
            <input
              v-model="form.code"
              class="block h-12 w-full border border-slate-200 rounded-xl border-solid bg-white py-3 pl-11 pr-24 text-slate-900 outline-none transition-all dark:border-slate-700/50 dark:bg-slate-800/50 dark:text-white"
              placeholder="请输入验证码"
              type="number"
            >
            <view class="absolute inset-y-0 right-0 z-10 flex items-center pr-2">
              <text class="px-3 py-1 text-sm text-primary font-semibold">获取验证码</text>
            </view>
          </view>
        </view>

        <!-- Options Row -->
        <view class="flex items-center justify-between py-2">
          <view class="group flex cursor-pointer items-center" @click="rememberMe = !rememberMe">
            <view class="relative">
              <view
                class="h-5 w-5 flex items-center justify-center rounded bg-slate-200 transition-colors dark:bg-slate-700"
                :class="{ 'bg-primary': rememberMe }"
              >
                <view v-if="rememberMe" class="i-carbon-checkmark text-xs text-white font-bold" />
              </view>
            </view>
            <text class="ml-2 text-sm text-slate-600 font-medium dark:text-slate-400">记住我</text>
          </view>
          <text class="text-sm text-primary font-semibold hover:text-primary/80" @click="handleSupport">
            忘记密码？
          </text>
        </view>

        <!-- Login Button -->
        <button
          class="mt-4 h-14 w-full flex items-center justify-center rounded-xl border-none bg-primary py-3 text-background-dark font-bold shadow-lg shadow-primary/20 transition-all !m-0 active:scale-[0.98] hover:bg-primary/90"
          :disabled="loading"
          @click="doLogin"
        >
          <view class="i-carbon-login mr-2" />
          <text>{{ loading ? '登录中...' : '立即登录' }}</text>
        </button>
      </view>

      <!-- Security Footer -->
      <view class="mt-12 flex flex-col items-center pb-10">
        <view class="mb-6 flex items-center text-slate-400 space-x-2 dark:text-slate-600">
          <view class="i-carbon-security mr-1 text-sm" />
          <text class="text-xs font-medium tracking-widest uppercase">端到端安全加密传输中</text>
        </view>
        <view class="w-full flex items-center justify-center space-x-12">
          <view class="flex flex-col items-center space-y-2" @click="handleSocialLogin('指纹')">
            <view
              class="h-12 w-12 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
            >
              <view class="i-carbon-fingerprint-recognition text-2xl" />
            </view>
            <text class="text-[10px] text-slate-500">指纹登录</text>
          </view>
          <view class="flex flex-col items-center space-y-2" @click="handleSocialLogin('面容')">
            <view
              class="h-12 w-12 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
            >
              <view class="i-carbon-face-satisfied text-2xl" />
            </view>
            <text class="text-[10px] text-slate-500">面容登录</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Contact Support -->
    <view class="flex items-center justify-center py-6 text-slate-400 space-x-1 dark:text-slate-600">
      <text class="text-xs">遇到问题？联系</text>
      <text class="ml-1 text-xs text-primary/80 font-bold" @click="handleSupport">技术支持</text>
    </view>
    <!-- iOS Home Indicator Spacer -->
    <view class="h-8 w-full" />
  </view>
</template>

<style lang="scss" scoped>
:deep(.uni-input-placeholder) {
  color: #64748b; // slate-500
}

.dark :deep(.uni-input-placeholder) {
  color: #475569; // slate-600
}

button::after {
  border: none;
}
</style>
