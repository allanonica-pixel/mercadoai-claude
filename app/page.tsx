export default function Home() {
  return (
    <>
      {/* ── ESTILOS GLOBAIS DA HOMEPAGE ── */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --orange: #E8620A; --orange-light: #FF7A1A; --orange-pale: #FFF3EC;
          --orange-border: #FFD4B3; --dark: #1A1A1A; --dark2: #2C2C2C;
          --gray1: #F7F7F5; --gray2: #EFEFED; --gray3: #C8C7C2;
          --gray4: #888780; --gray5: #555553; --text: #1A1A1A;
          --text2: #555553; --text3: #888780; --white: #FFFFFF;
          --green: #16A34A; --green-pale: #DCFCE7; --red: #DC2626;
          --red-pale: #FEE2E2; --radius-sm: 6px; --radius-md: 10px;
          --radius-lg: 14px; --radius-xl: 20px;
        }
        body { font-family: 'DM Sans', sans-serif; color: var(--text); background: var(--white); font-size: 15px; line-height: 1.5; }
        h1,h2,h3,h4,h5 { font-family: 'Sora', sans-serif; }
        a { text-decoration: none; color: inherit; }

        /* HEADER */
        .header-top { background: var(--white); border-bottom: 1px solid var(--gray2); padding: 0 40px; height: 60px; display: flex; align-items: center; justify-content: space-between; gap: 24px; position: sticky; top: 0; z-index: 100; }
        .logo { display: flex; align-items: center; gap: 8px; font-family: 'Sora', sans-serif; font-weight: 700; font-size: 20px; color: var(--text); flex-shrink: 0; }
        .logo-icon { width: 32px; height: 32px; background: var(--orange); border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .logo-icon svg { width: 18px; height: 18px; fill: white; }
        .nav { display: flex; align-items: center; gap: 4px; }
        .nav a { padding: 6px 12px; font-size: 14px; font-weight: 500; color: var(--text2); border-radius: var(--radius-sm); white-space: nowrap; transition: color 0.15s; }
        .nav a:hover { color: var(--text); }
        .search-bar { flex: 1; max-width: 320px; position: relative; }
        .search-bar input { width: 100%; height: 38px; border: 1px solid var(--gray2); border-radius: 20px; padding: 0 40px 0 16px; font-size: 14px; color: var(--text2); background: var(--gray1); outline: none; font-family: 'DM Sans', sans-serif; }
        .search-bar input::placeholder { color: var(--gray3); }
        .search-bar button { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--gray4); }
        .search-bar button svg { width: 16px; height: 16px; stroke: currentColor; fill: none; }

        /* CATEGORY BAR */
        .cat-bar { background: var(--white); border-bottom: 1px solid var(--gray2); padding: 0 40px; height: 44px; display: flex; align-items: center; gap: 8px; overflow-x: auto; scrollbar-width: none; position: sticky; top: 60px; z-index: 99; }
        .cat-bar::-webkit-scrollbar { display: none; }
        .cat-pill { display: flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; white-space: nowrap; cursor: pointer; transition: all 0.15s; border: 1px solid transparent; background: none; font-family: 'DM Sans', sans-serif; }
        .cat-pill svg { width: 14px; height: 14px; stroke: currentColor; fill: none; flex-shrink: 0; }
        .cat-pill.active { background: var(--dark); color: var(--white); }
        .cat-pill:not(.active) { color: var(--text2); border-color: var(--gray2); }
        .cat-pill:not(.active):hover { border-color: var(--gray3); color: var(--text); }
        .cat-pill.ofertas { background: var(--orange-pale); color: var(--orange); border-color: var(--orange-border); }
        .cat-pill.ofertas .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--orange); animation: pulse 1.5s infinite; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        .cat-bar-right { margin-left: auto; flex-shrink: 0; }
        .ver-todas-link { font-size: 13px; font-weight: 500; color: var(--orange); display: flex; align-items: center; gap: 4px; white-space: nowrap; }
        .ver-todas-link svg { width: 14px; height: 14px; stroke: currentColor; fill: none; }

        /* HERO */
        .hero { background: linear-gradient(135deg, #0D0D0D 0%, #1A1025 40%, #0D0D0D 100%); height: 340px; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; }
        .hero-content { text-align: center; z-index: 2; }
        .hero-content h1 { color: white; font-size: 42px; font-weight: 700; letter-spacing: -1px; line-height: 1.1; }
        .hero-content p { color: rgba(255,255,255,0.6); font-size: 16px; margin-top: 12px; }
        .hero-bg-logo { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.04; }
        .hero-bg-logo svg { width: 400px; height: 400px; fill: white; }
        .hero-arrow { position: absolute; top: 50%; transform: translateY(-50%); width: 42px; height: 42px; border-radius: 50%; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; cursor: pointer; color: white; z-index: 3; }
        .hero-arrow svg { width: 18px; height: 18px; stroke: currentColor; fill: none; }
        .hero-arrow.left { left: 20px; }
        .hero-arrow.right { right: 20px; }
        .hero-dots { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; z-index: 3; }
        .hero-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.3); }
        .hero-dot.active { background: var(--orange); width: 24px; border-radius: 4px; }
        .hero-badge { position: absolute; bottom: 20px; right: 20px; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2); color: white; font-size: 12px; font-weight: 500; padding: 6px 12px; border-radius: 20px; display: flex; align-items: center; gap: 6px; z-index: 3; backdrop-filter: blur(8px); }
        .hero-badge-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--orange); }

        /* SECTIONS */
        .section { padding: 48px 40px; }
        .section-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
        .section-title h2 { font-size: 26px; font-weight: 700; color: var(--text); letter-spacing: -0.5px; }
        .section-title p { font-size: 14px; color: var(--text3); margin-top: 4px; }
        .section-link { font-size: 13px; font-weight: 600; color: var(--orange); display: flex; align-items: center; gap: 4px; white-space: nowrap; margin-top: 6px; }
        .section-link svg { width: 14px; height: 14px; stroke: currentColor; fill: none; }

        /* MARKETPLACE TABS */
        .mp-tabs { display: flex; align-items: center; gap: 8px; margin-bottom: 24px; }
        .mp-label { font-size: 13px; color: var(--text3); font-weight: 500; margin-right: 4px; }
        .mp-tab { display: flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 500; cursor: pointer; border: 1px solid transparent; transition: all 0.15s; background: none; font-family: 'DM Sans', sans-serif; }
        .mp-tab.active { background: var(--dark); color: white; }
        .mp-tab:not(.active) { border-color: var(--gray2); color: var(--text2); }
        .mp-tab:not(.active):hover { border-color: var(--gray3); }

        /* PRODUCT GRID */
        .product-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .product-card { border: 1px solid var(--gray2); border-radius: var(--radius-lg); overflow: hidden; background: var(--white); transition: box-shadow 0.2s, transform 0.2s; cursor: pointer; }
        .product-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.08); transform: translateY(-2px); }
        .product-img-wrap { position: relative; background: var(--gray1); aspect-ratio: 4/3; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .badge-discount { position: absolute; top: 12px; left: 12px; background: var(--red); color: white; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: var(--radius-sm); }
        .product-info { padding: 16px; }
        .product-category { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600; color: var(--orange); background: var(--orange-pale); padding: 3px 8px; border-radius: var(--radius-sm); margin-bottom: 10px; }
        .product-title { font-size: 13px; font-weight: 500; color: var(--text); line-height: 1.4; margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .product-price-old { font-size: 12px; color: var(--text3); text-decoration: line-through; }
        .product-price { font-size: 20px; font-weight: 700; color: var(--text); font-family: 'Sora', sans-serif; margin: 2px 0 12px; }
        .product-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
        .tag { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 500; padding: 4px 8px; border-radius: var(--radius-sm); }
        .tag-ml { background: #FFF3DC; color: #B8860B; border: 1px solid #FFE0A0; }
        .tag-amazon { background: #FFF3DC; color: #B8860B; border: 1px solid #FFE0A0; }
        .tag-frete { background: var(--green-pale); color: var(--green); border: 1px solid #BBF7D0; }
        .tag-dot { width: 7px; height: 7px; border-radius: 50%; }
        .product-actions { display: flex; align-items: center; gap: 8px; }
        .btn-offer { flex: 1; height: 40px; background: var(--orange); color: white; border: none; border-radius: var(--radius-md); font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: background 0.15s; font-family: 'DM Sans', sans-serif; }
        .btn-offer:hover { background: var(--orange-light); }
        .btn-offer svg { width: 14px; height: 14px; stroke: currentColor; fill: none; }
        .btn-eye { width: 40px; height: 40px; border: 1px solid var(--gray2); border-radius: var(--radius-md); background: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--gray4); transition: border-color 0.15s; flex-shrink: 0; }
        .btn-eye:hover { border-color: var(--gray3); color: var(--text2); }
        .btn-eye svg { width: 16px; height: 16px; stroke: currentColor; fill: none; }

        /* MARKETPLACE BAR */
        .mp-bar { border-top: 1px solid var(--gray2); border-bottom: 1px solid var(--gray2); padding: 20px 40px; display: flex; align-items: center; gap: 32px; background: var(--white); }
        .mp-bar-label { font-size: 13px; color: var(--text3); white-space: nowrap; }
        .mp-logos { display: flex; align-items: center; gap: 28px; flex-wrap: wrap; }
        .mp-logo { display: flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 600; color: var(--text2); }
        .mp-logo-icon { width: 22px; height: 22px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; }
        .mp-logo-icon.amazon { background: #FF9900; color: white; }
        .mp-logo-icon.ml { background: #FFE600; color: #333; }
        .mp-logo-icon.shopee { background: #EE4D2D; color: white; }
        .mp-logo-icon.magalu { background: #0086FF; color: white; }
        .mp-logo-icon.americanas { background: #CC0000; color: white; }
        .mp-logo-icon.casas { background: #007BC4; color: white; }

        /* CATEGORY GRID */
        .cat-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 14px; }
        .cat-card { position: relative; border-radius: var(--radius-lg); overflow: hidden; aspect-ratio: 1; cursor: pointer; transition: transform 0.2s; }
        .cat-card:hover { transform: translateY(-3px); }
        .cat-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.1) 60%); }
        .cat-icon-wrap { position: absolute; top: 12px; left: 12px; width: 32px; height: 32px; border-radius: 8px; background: var(--orange); display: flex; align-items: center; justify-content: center; }
        .cat-icon-wrap svg { width: 16px; height: 16px; stroke: white; fill: none; }
        .cat-info { position: absolute; bottom: 12px; left: 12px; right: 12px; }
        .cat-info h4 { font-size: 14px; font-weight: 700; color: white; font-family: 'Sora', sans-serif; }
        .cat-info span { font-size: 11px; color: rgba(255,255,255,0.7); }
        .cat-eletronicos { background: linear-gradient(135deg, #1a1a2e, #16213e); }
        .cat-casa { background: linear-gradient(135deg, #e8f5e9, #c8e6c9); }
        .cat-beleza { background: linear-gradient(135deg, #fce4ec, #f8bbd0); }
        .cat-games { background: linear-gradient(135deg, #0d0d2b, #1a1a3e); }
        .cat-moda { background: linear-gradient(135deg, #f5f5f0, #ece9e0); }
        .cat-esportes { background: linear-gradient(135deg, #e3f2fd, #bbdefb); }

        /* ARTICLES */
        .articles-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .article-featured { border-radius: var(--radius-lg); overflow: hidden; background: var(--dark); position: relative; cursor: pointer; transition: transform 0.2s; }
        .article-featured:hover { transform: translateY(-2px); }
        .article-featured-img { width: 100%; aspect-ratio: 16/10; object-fit: cover; background: #2A2A2A; opacity: 0.7; }
        .article-featured-content { padding: 20px; }
        .article-tags { display: flex; gap: 8px; margin-bottom: 12px; }
        .article-tag { font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: var(--radius-sm); }
        .article-tag.eletronicos { background: var(--orange); color: white; }
        .article-tag.review { background: rgba(255,255,255,0.15); color: white; border: 1px solid rgba(255,255,255,0.25); }
        .article-featured h3 { font-size: 20px; font-weight: 700; color: white; line-height: 1.3; margin-bottom: 10px; }
        .article-featured p { font-size: 13px; color: rgba(255,255,255,0.65); line-height: 1.5; margin-bottom: 16px; }
        .article-meta { display: flex; align-items: center; gap: 16px; }
        .article-meta-item { display: flex; align-items: center; gap: 5px; font-size: 12px; color: rgba(255,255,255,0.5); }
        .article-meta-item svg { width: 13px; height: 13px; stroke: currentColor; fill: none; }
        .article-list { display: flex; flex-direction: column; gap: 2px; }
        .article-item { display: flex; gap: 14px; align-items: flex-start; padding: 14px; border-radius: var(--radius-md); cursor: pointer; border: 1px solid var(--gray2); background: var(--white); transition: box-shadow 0.15s; margin-bottom: 2px; }
        .article-item:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
        .article-item-content { flex: 1; min-width: 0; }
        .article-item-tag { font-size: 10px; font-weight: 700; color: var(--orange); text-transform: uppercase; margin-bottom: 5px; letter-spacing: 0.4px; }
        .article-item-title { font-size: 13px; font-weight: 600; color: var(--text); line-height: 1.4; margin-bottom: 6px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .article-item-meta { display: flex; gap: 12px; }
        .article-item-meta span { font-size: 11px; color: var(--text3); display: flex; align-items: center; gap: 4px; }
        .article-item-meta svg { width: 12px; height: 12px; stroke: currentColor; fill: none; }

        /* NEWSLETTER */
        .newsletter { background: #1A1A1A; margin: 0 40px 48px; border-radius: var(--radius-xl); padding: 48px 60px; display: flex; align-items: center; justify-content: space-between; gap: 40px; }
        .newsletter-text h2 { font-size: 28px; font-weight: 700; color: white; letter-spacing: -0.5px; margin-bottom: 10px; }
        .newsletter-text p { font-size: 15px; color: rgba(255,255,255,0.55); max-width: 380px; }
        .newsletter-form { display: flex; flex-direction: column; gap: 12px; min-width: 320px; }
        .newsletter-form input { height: 48px; border: 1px solid rgba(255,255,255,0.15); border-radius: var(--radius-md); padding: 0 16px; font-size: 14px; color: white; background: rgba(255,255,255,0.07); outline: none; font-family: 'DM Sans', sans-serif; }
        .newsletter-form input::placeholder { color: rgba(255,255,255,0.3); }
        .newsletter-form button { height: 48px; background: var(--orange); color: white; border: none; border-radius: var(--radius-md); font-size: 14px; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: background 0.15s; }
        .newsletter-form button:hover { background: var(--orange-light); }
        .newsletter-note { font-size: 12px; color: rgba(255,255,255,0.3); text-align: center; }

        /* FOOTER */
        footer { background: var(--dark); padding: 48px 40px 24px; }
        .footer-grid { display: grid; grid-template-columns: 200px repeat(3, 1fr); gap: 40px; margin-bottom: 40px; }
        .footer-brand p { font-size: 13px; color: rgba(255,255,255,0.45); line-height: 1.6; margin-bottom: 20px; margin-top: 12px; }
        .footer-social { display: flex; gap: 12px; }
        .footer-social a { width: 34px; height: 34px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.45); transition: all 0.15s; }
        .footer-social a:hover { border-color: rgba(255,255,255,0.35); color: white; }
        .footer-social svg { width: 16px; height: 16px; stroke: currentColor; fill: none; }
        .footer-col h4 { font-size: 13px; font-weight: 700; color: white; margin-bottom: 16px; font-family: 'Sora', sans-serif; }
        .footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 10px; }
        .footer-col ul li a { font-size: 13px; color: rgba(255,255,255,0.45); transition: color 0.15s; }
        .footer-col ul li a:hover { color: rgba(255,255,255,0.8); }
        .footer-newsletter-col h4 { font-size: 13px; font-weight: 700; color: white; margin-bottom: 10px; font-family: 'Sora', sans-serif; }
        .footer-newsletter-col p { font-size: 13px; color: rgba(255,255,255,0.45); margin-bottom: 14px; line-height: 1.6; }
        .footer-newsletter-col input { width: 100%; height: 40px; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.15); border-radius: var(--radius-md); padding: 0 14px; font-size: 13px; color: white; outline: none; margin-bottom: 10px; font-family: 'DM Sans', sans-serif; }
        .footer-newsletter-col input::placeholder { color: rgba(255,255,255,0.25); }
        .footer-newsletter-col button { width: 100%; height: 40px; background: var(--orange); color: white; border: none; border-radius: var(--radius-md); font-size: 13px; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .footer-bottom { border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px; display: flex; align-items: center; justify-content: space-between; }
        .footer-bottom p { font-size: 12px; color: rgba(255,255,255,0.3); }
        .footer-bottom-links { display: flex; gap: 20px; }
        .footer-bottom-links a { font-size: 12px; color: rgba(255,255,255,0.3); transition: color 0.15s; }
        .footer-bottom-links a:hover { color: rgba(255,255,255,0.6); }
      `}</style>

      {/* ── HEADER ── */}
      <header>
        <div className="header-top">
          <a href="/" className="logo">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            MercadoAI
          </a>
          <nav className="nav">
            <a href="/categorias">Categorias</a>
            <a href="/ofertas">Ofertas</a>
            <a href="/reviews">Reviews</a>
            <a href="/comparativo">Comparativos</a>
            <a href="/noticias">Notícias</a>
            <a href="/guias">Guias</a>
          </nav>
          <div className="search-bar">
            <input type="text" placeholder="Buscar produtos..." />
            <button>
              <svg viewBox="0 0 24 24" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>
          </div>
        </div>
        <div className="cat-bar">
          <button className="cat-pill active">
            <svg viewBox="0 0 24 24" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            Todos
          </button>
          <button className="cat-pill">
            <svg viewBox="0 0 24 24" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            Eletrônicos
          </button>
          <button className="cat-pill">
            <svg viewBox="0 0 24 24" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
            Smartphones
          </button>
          <button className="cat-pill">
            <svg viewBox="0 0 24 24" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            Notebooks
          </button>
          <button className="cat-pill">
            <svg viewBox="0 0 24 24" strokeWidth="2"><polygon points="6 3 20 12 6 21 6 3"/></svg>
            Games
          </button>
          <button className="cat-pill">
            <svg viewBox="0 0 24 24" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
            Eletrodomésticos
          </button>
          <button className="cat-pill">
            <svg viewBox="0 0 24 24" strokeWidth="2"><path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/></svg>
            Fones
          </button>
          <button className="cat-pill">
            <svg viewBox="0 0 24 24" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Smartwatches
          </button>
          <button className="cat-pill ofertas">
            <span className="dot"></span>
            Ofertas
          </button>
          <div className="cat-bar-right">
            <a href="/categorias" className="ver-todas-link">
              Ver todas
              <svg viewBox="0 0 24 24" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg-logo">
          <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        </div>
        <div className="hero-content">
          <h1>Os melhores produtos<br/>com os melhores preços</h1>
          <p>Comparamos preços em mais de 6 marketplaces para você economizar</p>
        </div>
        <button className="hero-arrow left">
          <svg viewBox="0 0 24 24" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button className="hero-arrow right">
          <svg viewBox="0 0 24 24" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <div className="hero-dots">
          <div className="hero-dot active"></div>
          <div className="hero-dot"></div>
          <div className="hero-dot"></div>
        </div>
        <div className="hero-badge">
          <span className="hero-badge-dot"></span>
          +10k produtos analisados
        </div>
      </section>

      {/* ── PRODUTOS EM DESTAQUE ── */}
      <section className="section">
        <div className="section-header">
          <div className="section-title">
            <h2>Produtos em Destaque</h2>
            <p>Selecionados pela nossa equipe com os melhores custo-benefício</p>
          </div>
          <a href="/produtos" className="section-link">
            Ver todos
            <svg viewBox="0 0 24 24" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>
        </div>
        <div className="mp-tabs">
          <span className="mp-label">Filtrar por:</span>
          <button className="mp-tab active">Todos</button>
          <button className="mp-tab">Amazon</button>
          <button className="mp-tab">Mercado Livre</button>
          <button className="mp-tab">Shopee</button>
          <button className="mp-tab">Magalu</button>
        </div>
        <div className="product-grid">
          {/* Card 1 */}
          <div className="product-card">
            <div className="product-img-wrap">
              <span className="badge-discount">-23%</span>
              <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                <rect width="120" height="120" fill="#F0F0F0"/>
                <rect x="20" y="30" width="80" height="55" rx="4" fill="#1A1A1A"/>
                <rect x="25" y="35" width="70" height="42" rx="2" fill="#2A2A5A"/>
                <rect x="45" y="88" width="30" height="4" rx="2" fill="#888"/>
              </svg>
            </div>
            <div className="product-info">
              <span className="product-category">Notebooks</span>
              <div className="product-title">MacBook Air M3 — 8GB RAM 256GB SSD Chip Apple M3</div>
              <div className="product-price-old">R$ 11.999</div>
              <div className="product-price">R$ 9.199</div>
              <div className="product-tags">
                <span className="tag tag-amazon"><span className="tag-dot" style={{background:'#FF9900'}}></span>Amazon</span>
                <span className="tag tag-frete">Frete grátis</span>
              </div>
              <div className="product-actions">
                <button className="btn-offer">
                  <svg viewBox="0 0 24 24" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  Ver Oferta
                </button>
                <button className="btn-eye">
                  <svg viewBox="0 0 24 24" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
            </div>
          </div>
          {/* Card 2 */}
          <div className="product-card">
            <div className="product-img-wrap">
              <span className="badge-discount">-18%</span>
              <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                <rect width="120" height="120" fill="#F5F0FF"/>
                <rect x="30" y="15" width="60" height="90" rx="8" fill="#1A1A2E"/>
                <rect x="34" y="22" width="52" height="72" rx="4" fill="#2A2A5E"/>
                <circle cx="60" cy="100" r="4" fill="#444"/>
              </svg>
            </div>
            <div className="product-info">
              <span className="product-category">Smartphones</span>
              <div className="product-title">Samsung Galaxy S24 Ultra 256GB 12GB RAM Titanium Black</div>
              <div className="product-price-old">R$ 7.499</div>
              <div className="product-price">R$ 6.149</div>
              <div className="product-tags">
                <span className="tag tag-ml"><span className="tag-dot" style={{background:'#FFE600'}}></span>Mercado Livre</span>
                <span className="tag tag-frete">Frete grátis</span>
              </div>
              <div className="product-actions">
                <button className="btn-offer">
                  <svg viewBox="0 0 24 24" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  Ver Oferta
                </button>
                <button className="btn-eye">
                  <svg viewBox="0 0 24 24" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
            </div>
          </div>
          {/* Card 3 */}
          <div className="product-card">
            <div className="product-img-wrap">
              <span className="badge-discount">-31%</span>
              <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                <rect width="120" height="120" fill="#FFF0F0"/>
                <rect x="25" y="40" width="70" height="45" rx="6" fill="#1A1A1A"/>
                <circle cx="45" cy="63" r="14" fill="#2A2A2A" stroke="#555" strokeWidth="1"/>
                <circle cx="75" cy="63" r="14" fill="#2A2A2A" stroke="#555" strokeWidth="1"/>
              </svg>
            </div>
            <div className="product-info">
              <span className="product-category">Fones</span>
              <div className="product-title">Sony WH-1000XM5 Fone Bluetooth Cancelamento de Ruído</div>
              <div className="product-price-old">R$ 2.199</div>
              <div className="product-price">R$ 1.519</div>
              <div className="product-tags">
                <span className="tag tag-amazon"><span className="tag-dot" style={{background:'#FF9900'}}></span>Amazon</span>
                <span className="tag tag-frete">Frete grátis</span>
              </div>
              <div className="product-actions">
                <button className="btn-offer">
                  <svg viewBox="0 0 24 24" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  Ver Oferta
                </button>
                <button className="btn-eye">
                  <svg viewBox="0 0 24 24" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MARKETPLACE BAR ── */}
      <div className="mp-bar">
        <span className="mp-bar-label">Comparamos em:</span>
        <div className="mp-logos">
          <div className="mp-logo"><span className="mp-logo-icon amazon">A</span>Amazon</div>
          <div className="mp-logo"><span className="mp-logo-icon ml">ML</span>Mercado Livre</div>
          <div className="mp-logo"><span className="mp-logo-icon shopee">S</span>Shopee</div>
          <div className="mp-logo"><span className="mp-logo-icon magalu">M</span>Magazine Luiza</div>
          <div className="mp-logo"><span className="mp-logo-icon americanas">A</span>Americanas</div>
          <div className="mp-logo"><span className="mp-logo-icon casas">C</span>Casas Bahia</div>
        </div>
      </div>

      {/* ── CATEGORIAS ── */}
      <section className="section">
        <div className="section-header">
          <div className="section-title">
            <h2>Explorar Categorias</h2>
            <p>Encontre os melhores produtos por categoria</p>
          </div>
          <a href="/categorias" className="section-link">
            Ver todas
            <svg viewBox="0 0 24 24" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>
        </div>
        <div className="cat-grid">
          <div className="cat-card cat-eletronicos">
            <div className="cat-overlay"></div>
            <div className="cat-icon-wrap">
              <svg viewBox="0 0 24 24" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            </div>
            <div className="cat-info"><h4>Eletrônicos</h4><span>1.240 produtos</span></div>
          </div>
          <div className="cat-card cat-casa">
            <div className="cat-overlay"></div>
            <div className="cat-icon-wrap">
              <svg viewBox="0 0 24 24" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
            </div>
            <div className="cat-info"><h4>Casa & Cozinha</h4><span>890 produtos</span></div>
          </div>
          <div className="cat-card cat-beleza">
            <div className="cat-overlay"></div>
            <div className="cat-icon-wrap">
              <svg viewBox="0 0 24 24" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
            </div>
            <div className="cat-info"><h4>Beleza</h4><span>654 produtos</span></div>
          </div>
          <div className="cat-card cat-games">
            <div className="cat-overlay"></div>
            <div className="cat-icon-wrap">
              <svg viewBox="0 0 24 24" strokeWidth="2"><polygon points="6 3 20 12 6 21 6 3"/></svg>
            </div>
            <div className="cat-info"><h4>Games</h4><span>432 produtos</span></div>
          </div>
          <div className="cat-card cat-moda">
            <div className="cat-overlay"></div>
            <div className="cat-icon-wrap">
              <svg viewBox="0 0 24 24" strokeWidth="2"><path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z"/></svg>
            </div>
            <div className="cat-info"><h4>Moda</h4><span>1.100 produtos</span></div>
          </div>
          <div className="cat-card cat-esportes">
            <div className="cat-overlay"></div>
            <div className="cat-icon-wrap">
              <svg viewBox="0 0 24 24" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
            </div>
            <div className="cat-info"><h4>Esportes</h4><span>780 produtos</span></div>
          </div>
        </div>
      </section>

      {/* ── ARTIGOS ── */}
      <section className="section" style={{paddingTop: 0}}>
        <div className="section-header">
          <div className="section-title">
            <h2>Guias & Reviews</h2>
            <p>Conteúdo para você comprar melhor</p>
          </div>
          <a href="/articles" className="section-link">
            Ver todos
            <svg viewBox="0 0 24 24" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>
        </div>
        <div className="articles-grid">
          <div className="article-featured">
            <svg className="article-featured-img" viewBox="0 0 600 375" fill="none">
              <rect width="600" height="375" fill="#1A1A2E"/>
              <rect x="100" y="60" width="400" height="255" rx="8" fill="#2A2A4E"/>
              <rect x="120" y="80" width="360" height="200" rx="4" fill="#3A3A6E"/>
            </svg>
            <div className="article-featured-content">
              <div className="article-tags">
                <span className="article-tag eletronicos">Eletrônicos</span>
                <span className="article-tag review">Review</span>
              </div>
              <h3>MacBook Air M3 Review: Vale a pena em 2026?</h3>
              <p>Testamos o novo MacBook Air M3 por 30 dias. Descubra se ele é o melhor notebook custo-benefício do mercado.</p>
              <div className="article-meta">
                <span className="article-meta-item">
                  <svg viewBox="0 0 24 24" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  3 min de leitura
                </span>
                <span className="article-meta-item">
                  <svg viewBox="0 0 24 24" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  125 visualizações
                </span>
              </div>
            </div>
          </div>
          <div className="article-list">
            {[
              { tag: "Comparativo", title: "iPhone 15 Pro Max vs Samsung Galaxy S24 Ultra: Qual vale mais?", time: "12 min", views: "3420" },
              { tag: "Comparativo", title: "Melhores fones com cancelamento de ruído 2026: Sony vs Apple vs Bose", time: "13 min", views: "1815" },
              { tag: "Guia de Compra", title: "Guia completo: como escolher um notebook em 2026", time: "18 min", views: "5171" },
              { tag: "Review", title: "Review Samsung Galaxy S24 Ultra: câmera de 200MP vale a pena?", time: "11 min", views: "2346" },
            ].map((item, i) => (
              <div key={i} className="article-item">
                <svg width="80" height="62" style={{flexShrink: 0, borderRadius: '8px'}} viewBox="0 0 80 62" fill="none">
                  <rect width="80" height="62" rx="6" fill="#E8F0FE"/>
                  <rect x="10" y="10" width="28" height="42" rx="4" fill="#4285F4"/>
                  <rect x="42" y="10" width="28" height="42" rx="4" fill="#1A1A2E"/>
                </svg>
                <div className="article-item-content">
                  <div className="article-item-tag">{item.tag}</div>
                  <div className="article-item-title">{item.title}</div>
                  <div className="article-item-meta">
                    <span>
                      <svg viewBox="0 0 24 24" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {item.time}
                    </span>
                    <span>
                      <svg viewBox="0 0 24 24" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      {item.views}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <div className="newsletter">
        <div className="newsletter-text">
          <h2>Receba as melhores ofertas</h2>
          <p>Cadastre seu e-mail e receba alertas de preço, reviews exclusivos e as melhores ofertas antes de todo mundo.</p>
        </div>
        <div className="newsletter-form">
          <input type="email" placeholder="seu@email.com" />
          <button>Quero Receber Ofertas</button>
          <span className="newsletter-note">Sem spam. Cancele quando quiser.</span>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer>
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="logo" style={{color: 'white'}}>
              <div className="logo-icon">
                <svg viewBox="0 0 24 24" fill="white"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              </div>
              MercadoAI
            </div>
            <p>Os melhores produtos com os melhores preços</p>
            <div className="footer-social">
              <a href="#"><svg viewBox="0 0 24 24" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>
              <a href="#"><svg viewBox="0 0 24 24" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg></a>
              <a href="#"><svg viewBox="0 0 24 24" strokeWidth="2"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg></a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Categorias Populares</h4>
            <ul>
              <li><a href="#">Eletrônicos</a></li>
              <li><a href="#">Casa &amp; Cozinha</a></li>
              <li><a href="#">Games</a></li>
              <li><a href="#">Smartphones</a></li>
              <li><a href="#">Notebooks</a></li>
              <li><a href="#">Smartwatches</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Recursos</h4>
            <ul>
              <li><a href="#">Guias de Compra</a></li>
              <li><a href="#">Reviews de Produtos</a></li>
              <li><a href="#">Melhores Ofertas</a></li>
              <li><a href="#">Sobre Nós</a></li>
              <li><a href="#">Contato</a></li>
              <li><a href="/privacidade">Política de Privacidade</a></li>
              <li><a href="/termos">Termos de Uso</a></li>
            </ul>
          </div>
          <div className="footer-col footer-newsletter-col">
            <h4>Receba Ofertas Exclusivas</h4>
            <p>Cadastre seu e-mail e receba as melhores ofertas e reviews antes de todo mundo.</p>
            <input type="email" placeholder="seu@email.com" />
            <button>Quero Receber Ofertas</button>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 MercadoAI. Todos os direitos reservados. Este site contém links de afiliados.</p>
          <div className="footer-bottom-links">
            <a href="/termos">Termos</a>
            <a href="/privacidade">Privacidade</a>
            <a href="#">Sobre Nós</a>
          </div>
        </div>
      </footer>
    </>
  )
}
