<template lang="pug">
  footer.app-footer
    div.navi
      nav.link
        ul
          router-link.nav__item(tag="li" to="/contact/" exact): a お問い合わせ
          router-link.nav__item(tag="li" to="/privacy/" exact): a プライパシーポリシー
          router-link.nav__item(tag="li" to="/terms/" exact): a 利用規約
          router-link.nav__item(tag='li' to='/'): a(href='#', v-scroll-to="'#howto'") 使い方

      div.link
        ul.social-button-syncer
          li.sc-tw
            a.twitter-share-button(href="https://twitter.com/intent/tweet")
          li.sc-fb
            .fb-like(data-width='80', data-layout='button_count', data-action='like', data-size='small', data-show-faces='true', data-share='false')
          li
            a.hatena-bookmark-button(href='http://b.hatena.ne.jp/entry/https://kamatte.cc', data-hatena-bookmark-layout='basic-label', data-hatena-bookmark-lang='ja', title='このエントリーをはてなブックマークに追加')
              img(src='https://b.st-hatena.com/images/entry-button/button-only@2x.png', alt='このエントリーをはてなブックマークに追加', width='20', height='20', style='border:none;')
</template>
