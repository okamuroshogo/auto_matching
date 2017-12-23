<template lang="pug">
  footer.app-footer
    div.navi
      nav.link
        ul
          li.nav__item: a(href="/contact") お問い合わせ
          li.nav__item: a(href="/privacy") プライパシーポリシー
          li.nav__item: a(href="/terms") 利用規約
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
