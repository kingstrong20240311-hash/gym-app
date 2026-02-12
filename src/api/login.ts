import type { ICaptcha, ILoginRes, IUpdateInfo, IUpdatePassword, IUserInfoRes } from './types/login'
import { http } from '@/http/http'
import { encryptOAuth2Password, getOAuth2BasicAuthorization } from '@/utils/oauth2'

/**
 * 登录表单
 */
export interface ILoginForm {
  username?: string
  email?: string
  password: string
}

/**
 * 获取验证码
 * @returns ICaptcha 验证码
 */
export function getCode() {
  return http.get<ICaptcha>('/user/getCode')
}

/**
 * 用户登录
 * @param loginForm 登录表单
 */
function requestOAuth2Token(formBody: string) {
  return new Promise<ILoginRes>((resolve, reject) => {
    uni.request({
      url: '/oauth2/token',
      method: 'POST',
      data: formBody,
      header: {
        'Authorization': getOAuth2BasicAuthorization(),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      success(res) {
        const data = res.data as any
        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (data?.access_token) {
            resolve(data)
            return
          }
          if (data?.data?.access_token) {
            resolve(data.data)
            return
          }
        }
        reject(data)
      },
      fail(err) {
        reject(err)
      },
    })
  })
}

export async function login(loginForm: ILoginForm) {
  const username = loginForm.username || loginForm.email
  if (!username) {
    throw new Error('登录参数缺少 username/email')
  }

  const encryptedPassword = await encryptOAuth2Password(loginForm.password)
  const formBody = [
    'grant_type=password',
    `username=${encodeURIComponent(username)}`,
    `password=${encodeURIComponent(encryptedPassword)}`,
  ].join('&')

  return requestOAuth2Token(formBody)
}

/**
 * 刷新token
 * @param refreshToken 刷新token
 */
export function refreshToken(refreshToken: string) {
  const formBody = [
    'grant_type=refresh_token',
    `refresh_token=${encodeURIComponent(refreshToken)}`,
  ].join('&')
  return requestOAuth2Token(formBody)
}

/**
 * 获取用户信息
 */
export function getUserInfo() {
  return http.get<IUserInfoRes>('/user/info')
}

/**
 * 退出登录
 */
export function logout() {
  return http.get<void>('/auth/logout')
}

/**
 * 修改用户信息
 */
export function updateInfo(data: IUpdateInfo) {
  return http.post('/user/updateInfo', data)
}

/**
 * 修改用户密码
 */
export function updateUserPassword(data: IUpdatePassword) {
  return http.post('/user/updatePassword', data)
}

/**
 * 获取微信登录凭证
 * @returns Promise 包含微信登录凭证(code)
 */
export function getWxCode() {
  return new Promise<UniApp.LoginRes>((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success: res => resolve(res),
      fail: err => reject(new Error(err)),
    })
  })
}

/**
 * 微信登录
 * @param params 微信登录参数，包含code
 * @returns Promise 包含登录结果
 */
export function wxLogin(data: { code: string }) {
  return http.post<ILoginRes>('/auth/wxLogin', data)
}
