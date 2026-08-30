import { clarityTagUrl } from "@/lib/clarity"
import { shopConfig } from "@/lib/config"

export function Clarity() {
  const src = clarityTagUrl(shopConfig().clarityId)
  if (!src) return null
  const id = shopConfig().clarityId.trim()
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="${src}";y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${id}");`,
      }}
    />
  )
}
