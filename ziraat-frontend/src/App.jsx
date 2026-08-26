import React, { useState } from 'react';

export default function App() {
  // Backend API Adresi
  const API_BASE = 'https://ziraat-webapp.onrender.com';

  const [view, setView] = useState('login');
  
  // Kayıt form state'leri
  const [regName, setRegName] = useState('');
  const [regTc, setRegTc] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Giriş form state'leri
  const [loginTc, setLoginTc] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginTime, setLoginTime] = useState('');

  // Aktif kullanıcı ve bakiye state'leri
  const [currentUser, setCurrentUser] = useState(null);
  const [balance, setBalance] = useState(14250.50);
  const [showBalance, setShowBalance] = useState(true);

  // Modal Kontrolleri
  const [activeModal, setActiveModal] = useState(null);
  
  // Alt Görünüm State'leri
  const [cardDetail, setCardDetail] = useState(null);
  const [txFilter, setTxFilter] = useState('all');
  const [investmentDetail, setInvestmentDetail] = useState(null);
  const [islemDetail, setIslemDetail] = useState(null);
  
  // Fatura Ödeme State'leri
  const [faturaTipi, setFaturaTipi] = useState('Elektrik');
  const [aboneNo, setAboneNo] = useState('');
  const [faturaTutar, setFaturaTutar] = useState('');

  // Şifre Değiştirme State'leri
  const [eskiSifre, setEskiSifre] = useState('');
  const [yeniSifre, setYeniSifre] = useState('');
  
  // Para Gönder & Kayıtlı Alıcı State'leri
  const [transferTab, setTransferTab] = useState('form');
  const [recipientName, setRecipientName] = useState('');
  const [iban, setIban] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [saveRecipient, setSaveRecipient] = useState(false);

  // Kayıtlı Alıcılar Listesi
  const [savedRecipients, setSavedRecipients] = useState(() => {
    return JSON.parse(localStorage.getItem('ziraat_saved_recipients')) || [
      { name: 'Ahmet Yılmaz', iban: 'TR33 0001 0001 2345 6789 01' },
      { name: 'Ayşe Demir', iban: 'TR88 0006 2000 1234 5678 90' }
    ];
  });

  // Son Hareketler Listesi State'i
  const [transactions, setTransactions] = useState([
    { title: 'Ziraat Teknoloji', desc: 'Staj Ödemesi', amount: '+12.500,00 TL', type: 'income', code: 'ZT', date: new Date() },
    { title: 'Market Alışverişi', desc: 'POS Harcaması', amount: '-450,00 TL', type: 'expense', code: 'M', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    { title: 'Kira Ödemesi', desc: 'EFT Transferi', amount: '-4.500,00 TL', type: 'expense', code: 'K', date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
    { title: 'Online Alışveriş', desc: 'E-Ticaret Harcaması', amount: '-850,00 TL', type: 'expense', code: 'E', date: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000) }
  ]);

  // 1. KAYIT OLMA (Backend + LocalStorage Yedekli)
  const handleRegister = async (e) => {
    e.preventDefault();
    if (regPassword.length !== 6) {
      alert('Lütfen 6 haneli bir parola giriniz!');
      return;
    }

    const newUser = {
      fullName: regName,
      tc: regTc,
      password: regPassword,
      iban: 'TR54 0001 0000 1234 5678 90'
    };

    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });

      if (response.ok) {
        alert('Hesap başarıyla oluşturuldu! Şimdi giriş yapabilirsiniz.');
        setView('login');
        setRegName(''); setRegTc(''); setRegPassword('');
        return;
      }
    } catch (err) {
      console.warn('Backend bağlantısı kurulamadı, yerel hafıza kullanılıyor.', err);
    }

    // Yedek: LocalStorage İşlemi
    const existingUsers = JSON.parse(localStorage.getItem('ziraat_users')) || [];
    if (existingUsers.find(u => u.tc === regTc)) {
      alert('Bu T.C. Kimlik Numarası ile zaten bir hesap var!');
      return;
    }

    existingUsers.push(newUser);
    localStorage.setItem('ziraat_users', JSON.stringify(existingUsers));
    alert('Hesap yerel olarak başarıyla oluşturuldu! Şimdi giriş yapabilirsiniz.');
    setView('login');
    setRegName(''); setRegTc(''); setRegPassword('');
  };

  // 2. GİRİŞ YAPMA (Backend + LocalStorage Yedekli)
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tc: loginTc, password: loginPassword })
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data);
        successLogin();
        return;
      }
    } catch (err) {
      console.warn('Backend bağlantısı kurulamadı, yerel hafıza kontrol ediliyor.', err);
    }

    // Yedek: LocalStorage Kontrolü
    const existingUsers = JSON.parse(localStorage.getItem('ziraat_users')) || [];
    const foundUser = existingUsers.find(u => u.tc === loginTc && u.password === loginPassword);

    if (foundUser) {
      setCurrentUser(foundUser);
      successLogin();
    } else {
      alert('T.C. Kimlik Numarası veya Parola hatalı!');
    }
  };

  const successLogin = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    setLoginTime(`Bugün, ${timeString}`);
    setView('dashboard');
  };

  // 3. ÇIKIŞ YAPMA
  const handleLogout = () => {
    setCurrentUser(null);
    setView('login');
    setLoginTc('');
    setLoginPassword('');
  };

  // 4. PARA GÖNDERME İŞLEMİ
  const handleSendMoney = (e) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert('Lütfen geçerli bir tutar girin!');
      return;
    }

    if (numericAmount > balance) {
      alert('Yetersiz bakiye!');
      return;
    }

    setBalance(prev => prev - numericAmount);

    const newTx = {
      title: recipientName || 'EFT / Para Gönderimi',
      desc: description ? `${description} (${iban})` : iban,
      amount: `-${numericAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`,
      type: 'expense',
      code: recipientName ? recipientName.charAt(0).toUpperCase() : 'EG',
      date: new Date()
    };

    setTransactions([newTx, ...transactions]);

    if (saveRecipient && recipientName && iban) {
      const exists = savedRecipients.some(r => r.iban === iban);
      if (!exists) {
        const updatedList = [...savedRecipients, { name: recipientName, iban }];
        setSavedRecipients(updatedList);
        localStorage.setItem('ziraat_saved_recipients', JSON.stringify(updatedList));
      }
    }

    alert(`${numericAmount.toLocaleString('tr-TR')} TL başarıyla gönderildi!`);
    setActiveModal(null);
    setIban('');
    setAmount('');
    setRecipientName('');
    setDescription('');
    setSaveRecipient(false);
    setTransferTab('form');
  };

  // 5. FATURA ÖDEME İŞLEMİ
  const handlePayBill = (e) => {
    e.preventDefault();
    const t = parseFloat(faturaTutar);
    if (isNaN(t) || t <= 0) {
      alert('Lütfen geçerli bir fatura tutarı girin!');
      return;
    }
    if (t > balance) {
      alert('Yetersiz bakiye!');
      return;
    }

    setBalance(prev => prev - t);
    const newTx = {
      title: `${faturaTipi} Faturası`,
      desc: `Abone No: ${aboneNo}`,
      amount: `-${t.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`,
      type: 'expense',
      code: faturaTipi.charAt(0),
      date: new Date()
    };
    setTransactions([newTx, ...transactions]);
    alert(`${faturaTipi} faturası başarıyla ödendi!`);
    setActiveModal(null);
    setIslemDetail(null);
    setFaturaTutar('');
    setAboneNo('');
  };

  // 6. ŞİFRE DEĞİŞTİRME İŞLEMİ
  const handleChangePassword = (e) => {
    e.preventDefault();
    if (eskiSifre !== currentUser.password) {
      alert('Mevcut parolanız hatalı!');
      return;
    }
    if (yeniSifre.length !== 6) {
      alert('Yeni parola 6 haneli olmalıdır!');
      return;
    }

    const updatedUser = { ...currentUser, password: yeniSifre };
    setCurrentUser(updatedUser);

    const existingUsers = JSON.parse(localStorage.getItem('ziraat_users')) || [];
    const updatedUsers = existingUsers.map(u => u.tc === updatedUser.tc ? updatedUser : u);
    localStorage.setItem('ziraat_users', JSON.stringify(updatedUsers));

    alert('Parolanız başarıyla değiştirildi!');
    setActiveModal(null);
    setIslemDetail(null);
    setEskiSifre('');
    setYeniSifre('');
  };

  const handleSelectSavedRecipient = (recipient) => {
    setRecipientName(recipient.name);
    setIban(recipient.iban);
    setTransferTab('form');
  };

  const filteredTransactions = transactions.filter(tx => {
    const txDate = new Date(tx.date);
    const now = new Date();
    if (txFilter === '1day') {
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      return txDate >= oneDayAgo;
    } else if (txFilter === '1month') {
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return txDate >= oneMonthAgo;
    }
    return true;
  });

  // --- KAYIT EKRANI ---
  if (view === 'register') {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center font-sans px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 sm:p-10 border border-slate-200/80">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Ziraat Dijital</h1>
            <p className="text-sm text-slate-500 mt-1">Yeni Hesap Oluşturma</p>
          </div>
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">İsim Soyisim</label>
              <input type="text" value={regName} onChange={(e) => setRegName(e.target.value)} required className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#d32f2f] text-sm" placeholder="Büşra Yılmaz" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">T.C. Kimlik No</label>
              <input type="text" maxLength="11" value={regTc} onChange={(e) => setRegTc(e.target.value)} required className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#d32f2f] text-sm" placeholder="11 haneli T.C." />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">6 Haneli Parola</label>
              <input type="password" maxLength="6" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#d32f2f] text-sm tracking-widest" placeholder="••••••" />
            </div>
            <button type="submit" className="w-full py-4 bg-[#d32f2f] hover:bg-[#b71c1c] text-white font-bold rounded-2xl shadow-lg transition-all text-base mt-2">Hesap Oluştur</button>
          </form>
          <div className="mt-6 text-center">
            <button onClick={() => setView('login')} className="text-xs text-slate-500 hover:text-[#d32f2f] font-bold">Zaten hesabın var mı? <span className="underline">Giriş Yap</span></button>
          </div>
        </div>
      </div>
    );
  }

  // --- GİRİŞ EKRANI ---
  if (view === 'login') {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center font-sans px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 sm:p-10 border border-slate-200/80">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Ziraat Dijital</h1>
            <p className="text-sm text-slate-500 mt-1">Giriş Paneli</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">T.C. Kimlik Numarası</label>
              <input type="text" maxLength="11" value={loginTc} onChange={(e) => setLoginTc(e.target.value)} required className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#d32f2f] text-sm" placeholder="11 haneli T.C." />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">6 Haneli Parola</label>
              <input type="password" maxLength="6" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#d32f2f] text-sm tracking-widest" placeholder="••••••" />
            </div>
            <button type="submit" className="w-full py-4 bg-[#d32f2f] hover:bg-[#b71c1c] text-white font-bold rounded-2xl shadow-lg transition-all text-base">Giriş Yap</button>
          </form>
          <div className="mt-6 text-center">
            <button onClick={() => setView('register')} className="text-xs text-slate-500 hover:text-[#d32f2f] font-bold">Hesabın yok mu? <span className="underline">Hemen Hesap Aç</span></button>
          </div>
        </div>
      </div>
    );
  }

  // --- ANA PANEL (DASHBOARD) ---
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans relative">
      
      <header className="bg-[#d32f2f] text-white shadow-md w-full">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-24 flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Ziraat Dijital</h1>
            <p className="text-sm text-red-100 font-medium">Hoş Geldiniz, {currentUser?.fullName}</p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="hidden sm:block text-right">
              <p className="text-sm text-red-100">Son Güvenli Giriş</p>
              <p className="text-sm font-semibold">{loginTime || 'Bugün'}</p>
            </div>
            <button onClick={handleLogout} className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-white/20 transition-all">Güvenli Çıkış</button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="space-y-8 lg:col-span-1">
            <div className="bg-gradient-to-br from-[#d32f2f] to-[#b71c1c] text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="flex justify-between items-center text-sm text-red-100 mb-4">
                <span className="font-semibold">Vadesiz Hesap</span>
                <button onClick={() => setShowBalance(!showBalance)} className="text-white underline text-sm hover:text-red-200">{showBalance ? 'Gizle' : 'Göster'}</button>
              </div>
              <div className="text-4xl sm:text-5xl font-black tracking-tight mb-8">
                {showBalance ? `${balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL` : '•••••• TL'}
              </div>
              <div className="pt-5 border-t border-white/20 flex justify-between items-center text-sm text-red-100">
                <span className="truncate mr-2">IBAN: {currentUser?.iban || 'TR54 0001 0000 1234 5678 90'}</span>
                <span className="font-bold underline cursor-pointer hover:text-white whitespace-nowrap" onClick={() => { navigator.clipboard.writeText(currentUser?.iban || 'TR54 0001 0000 1234 5678 90'); alert('IBAN kopyalandı!'); }}>Kopyala</span>
              </div>
            </div>
          </div>

          <div className="space-y-8 lg:col-span-2">
            
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200/80">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Hızlı İşlemler</h2>
              <div className="grid grid-cols-4 gap-6 text-center">
                
                <div onClick={() => { setActiveModal('paraGonder'); setTransferTab('form'); }} className="flex flex-col items-center cursor-pointer group transform transition-all duration-300 hover:-translate-y-1 hover:scale-105">
                  <div className="w-20 h-20 rounded-3xl bg-red-50 text-[#d32f2f] flex items-center justify-center text-4xl shadow-md group-hover:bg-[#d32f2f] group-hover:text-white transition-all">💸</div>
                  <span className="text-sm text-slate-700 mt-3 font-semibold">Para Gönder</span>
                </div>

                <div onClick={() => { setActiveModal('kartlarim'); setCardDetail(null); }} className="flex flex-col items-center cursor-pointer group transform transition-all duration-300 hover:-translate-y-1 hover:scale-105">
                  <div className="w-20 h-20 rounded-3xl bg-red-50 text-[#d32f2f] flex items-center justify-center text-4xl shadow-md group-hover:bg-[#d32f2f] group-hover:text-white transition-all">💳</div>
                  <span className="text-sm text-slate-700 mt-3 font-semibold">Kartlarım</span>
                </div>

                <div onClick={() => { setActiveModal('yatirim'); setInvestmentDetail(null); }} className="flex flex-col items-center cursor-pointer group transform transition-all duration-300 hover:-translate-y-1 hover:scale-105">
                  <div className="w-20 h-20 rounded-3xl bg-red-50 text-[#d32f2f] flex items-center justify-center text-4xl shadow-md group-hover:bg-[#d32f2f] group-hover:text-white transition-all">📊</div>
                  <span className="text-sm text-slate-700 mt-3 font-semibold">Yatırım</span>
                </div>

                <div onClick={() => { setActiveModal('islemler'); setIslemDetail(null); }} className="flex flex-col items-center cursor-pointer group transform transition-all duration-300 hover:-translate-y-1 hover:scale-105">
                  <div className="w-20 h-20 rounded-3xl bg-red-50 text-[#d32f2f] flex items-center justify-center text-4xl shadow-md group-hover:bg-[#d32f2f] group-hover:text-white transition-all">⚙️</div>
                  <span className="text-sm text-slate-700 mt-3 font-semibold">İşlemler</span>
                </div>

              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200/80">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Son Hareketler</h2>
                <span onClick={() => { setActiveModal('tumIslemler'); setTxFilter('all'); }} className="text-sm text-[#d32f2f] font-bold cursor-pointer hover:underline">Tümünü Gör</span>
              </div>
              
              <div className="space-y-4">
                {transactions.slice(0, 2).map((tx, idx) => (
                  <div key={idx} className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100/80 transition-all">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-red-100 text-[#d32f2f] flex items-center justify-center font-bold text-sm shadow-sm">{tx.code}</div>
                      <div>
                        <p className="text-base font-bold text-slate-800">{tx.title}</p>
                        <p className="text-sm text-slate-400 font-medium">{tx.desc}</p>
                      </div>
                    </div>
                    <span className={`text-base font-extrabold ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-800'}`}>{tx.amount}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* --- MODALLER --- */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 border border-slate-100 relative animate-in fade-in zoom-in duration-200">
            
            {activeModal === 'tumIslemler' && (
              <div className="max-h-[85vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-800">Tüm Hesap Hareketleri</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Tüm gelir ve gider geçmişiniz</p>
                  </div>
                  <button onClick={() => setActiveModal(null)} className="w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600 transition-all">✕</button>
                </div>

                <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-5 space-x-2">
                  <button onClick={() => setTxFilter('all')} className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${txFilter === 'all' ? 'bg-white text-[#d32f2f] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Tümü</button>
                  <button onClick={() => setTxFilter('1day')} className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${txFilter === '1day' ? 'bg-white text-[#d32f2f] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Son 1 Gün</button>
                  <button onClick={() => setTxFilter('1month')} className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${txFilter === '1month' ? 'bg-white text-[#d32f2f] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Son 1 Ay</button>
                </div>

                <div className="space-y-3 overflow-y-auto pr-1 flex-1 max-h-96">
                  {filteredTransactions.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-8">Seçilen aralıkta hesap hareketi bulunmuyor.</p>
                  ) : (
                    filteredTransactions.map((tx, idx) => (
                      <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-red-100 text-[#d32f2f] flex items-center justify-center font-bold text-xs shadow-sm">{tx.code}</div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{tx.title}</p>
                            <p className="text-xs text-slate-400 font-medium">{tx.desc}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{new Date(tx.date).toLocaleDateString('tr-TR')} {new Date(tx.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                        <span className={`text-sm font-extrabold ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-800'}`}>{tx.amount}</span>
                      </div>
                    ))
                  )}
                </div>

                <button onClick={() => setActiveModal(null)} className="w-full mt-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all">Kapat</button>
              </div>
            )}

            {activeModal === 'paraGonder' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-800">Para Gönder (EFT / Havale)</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Alıcı adı, IBAN, açıklama ve tutar bilgilerini girin.</p>
                  </div>
                  <button onClick={() => setActiveModal(null)} className="w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600 transition-all">✕</button>
                </div>

                <div className="flex border-b border-slate-200 mb-6 text-sm font-bold">
                  <button onClick={() => setTransferTab('form')} className={`pb-2.5 mr-6 border-b-2 transition-all ${transferTab === 'form' ? 'border-[#d32f2f] text-[#d32f2f]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Yeni Para Gönder</button>
                  <button onClick={() => setTransferTab('list')} className={`pb-2.5 border-b-2 transition-all ${transferTab === 'list' ? 'border-[#d32f2f] text-[#d32f2f]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Kayıtlı Alıcılarım ({savedRecipients.length})</button>
                </div>

                {transferTab === 'form' ? (
                  <form onSubmit={handleSendMoney} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Alıcı Adı Soyadı</label>
                      <input type="text" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} required placeholder="Örn: Ahmet Yılmaz" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-[#d32f2f] focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Alıcı IBAN</label>
                      <input type="text" value={iban} onChange={(e) => setIban(e.target.value)} required placeholder="TRXX XXXX ..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-[#d32f2f] focus:outline-none font-mono" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Açıklama</label>
                      <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Örn: Kira Ödemesi, Borç vb." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-[#d32f2f] focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tutar (TL)</label>
                      <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required placeholder="0.00" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-[#d32f2f] focus:outline-none" />
                    </div>

                    <div className="flex items-center space-x-2 pt-1">
                      <input type="checkbox" id="saveRec" checked={saveRecipient} onChange={(e) => setSaveRecipient(e.target.checked)} className="w-4 h-4 text-[#d32f2f] rounded border-slate-300 focus:ring-[#d32f2f]" />
                      <label htmlFor="saveRec" className="text-xs font-bold text-slate-600 cursor-pointer">Bu kişiyi kayıtlı alıcılarıma ekle</label>
                    </div>

                    <div className="flex space-x-4 pt-4">
                      <button type="button" onClick={() => setActiveModal(null)} className="w-1/2 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all">İptal</button>
                      <button type="submit" className="w-1/2 py-3.5 bg-[#d32f2f] hover:bg-[#b71c1c] text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-500/30">Gönder</button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    <p className="text-xs text-slate-400 font-medium mb-2">Para göndermek istediğiniz kayıtlı alıcının üstüne tıklayabilirsiniz:</p>
                    {savedRecipients.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-6">Henüz kayıtlı alıcınız bulunmuyor.</p>
                    ) : (
                      savedRecipients.map((rec, index) => (
                        <div key={index} onClick={() => handleSelectSavedRecipient(rec)} className="p-4 bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-2xl cursor-pointer transition-all group">
                          <p className="font-extrabold text-slate-800 group-hover:text-[#d32f2f] text-sm">{rec.name}</p>
                          <p className="text-xs text-slate-400 font-mono mt-1">{rec.iban}</p>
                        </div>
                      ))
                    )}
                    <button type="button" onClick={() => setActiveModal(null)} className="w-full mt-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all">Kapat</button>
                  </div>
                )}
              </div>
            )}

            {activeModal === 'kartlarim' && (
              <div>
                {cardDetail === null ? (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-xl font-black text-slate-800">Kartlarım</h3>
                        <p className="text-xs text-slate-500 mt-0.5">İşlem yapmak istediğiniz kart türünü seçin</p>
                      </div>
                      <button onClick={() => setActiveModal(null)} className="w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600 transition-all">✕</button>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div onClick={() => setCardDetail('banka')} className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-md cursor-pointer hover:scale-[1.01] transition-all group border border-slate-700">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-[#d32f2f] text-white flex items-center justify-center font-bold text-lg">💳</div>
                            <div>
                              <h4 className="font-extrabold text-white text-sm group-hover:text-red-400 transition-colors">Banka Kartı (Debit) →</h4>
                              <p className="text-xs text-slate-400">Vadesiz hesap bağlı kartınız</p>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-full border border-emerald-500/30">Aktif</span>
                        </div>
                        <p className="text-sm font-mono tracking-widest text-slate-300 mt-3">4582 3400 •••• 9812</p>
                      </div>

                      <div onClick={() => setCardDetail('kredi')} className="p-5 bg-gradient-to-br from-amber-700 to-amber-900 text-white rounded-2xl shadow-md cursor-pointer hover:scale-[1.01] transition-all group border border-amber-600/50">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg">💳</div>
                            <div>
                              <h4 className="font-extrabold text-white text-sm group-hover:text-amber-300 transition-colors">Kredi Kartı (Maximum) →</h4>
                              <p className="text-xs text-amber-200/80">Kalan Limit: 25.000 TL</p>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 bg-amber-500/20 text-amber-200 text-[10px] font-bold rounded-full border border-amber-500/30">Aktif</span>
                        </div>
                        <p className="text-sm font-mono tracking-widest text-amber-100 mt-3">5400 1200 •••• 4421</p>
                      </div>
                    </div>

                    <button onClick={() => setActiveModal(null)} className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all">Kapat</button>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-xl font-black text-slate-800">{cardDetail === 'banka' ? 'Banka Kartı Detayları' : 'Kredi Kartı Detayları'}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Kart ayarları ve şifre işlemleri</p>
                      </div>
                      <button onClick={() => setCardDetail(null)} className="w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600 transition-all">←</button>
                    </div>

                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 mb-6">
                      <p className="text-sm font-bold text-slate-700">Durum: <span className="text-emerald-600">Kullanıma Açık</span></p>
                      <p className="text-sm font-bold text-slate-700">Temassız İşlem: <span className="text-slate-600">Açık</span></p>
                      <p className="text-sm font-bold text-slate-700">İnternet Alışverişi: <span className="text-slate-600">Açık</span></p>
                    </div>

                    <button onClick={() => { alert('Kart ayarları güncellendi!'); setActiveModal(null); setCardDetail(null); }} className="w-full py-3.5 bg-[#d32f2f] hover:bg-[#b71c1c] text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-500/30">Ayarları Kaydet</button>
                  </div>
                )}
              </div>
            )}

            {activeModal === 'yatirim' && (
              <div>
                {investmentDetail === null ? (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-xl font-black text-slate-800">Yatırım İşlemleri</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Altın ve döviz hesaplarınızı yönetin</p>
                      </div>
                      <button onClick={() => setActiveModal(null)} className="w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600 transition-all">✕</button>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div onClick={() => setInvestmentDetail('altin')} className="p-5 bg-slate-50 hover:bg-red-50 border border-slate-200 rounded-2xl cursor-pointer transition-all flex justify-between items-center group">
                        <div>
                          <h4 className="font-extrabold text-slate-800 group-hover:text-[#d32f2f] text-sm">Altın Hesabı (Gram)</h4>
                          <p className="text-xs text-slate-400 mt-1">Alış: 2.450,00 TL | Satış: 2.470,00 TL</p>
                        </div>
                        <span className="text-lg font-black text-slate-700">🥇</span>
                      </div>

                      <div onClick={() => setInvestmentDetail('doviz')} className="p-5 bg-slate-50 hover:bg-red-50 border border-slate-200 rounded-2xl cursor-pointer transition-all flex justify-between items-center group">
                        <div>
                          <h4 className="font-extrabold text-slate-800 group-hover:text-[#d32f2f] text-sm">Döviz İşlemleri (USD / EUR)</h4>
                          <p className="text-xs text-slate-400 mt-1">USD/TRY Alış: 32,20 TL</p>
                        </div>
                        <span className="text-lg font-black text-slate-700">💵</span>
                      </div>
                    </div>

                    <button onClick={() => setActiveModal(null)} className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all">Kapat</button>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-xl font-black text-slate-800">{investmentDetail === 'altin' ? 'Altın Al / Sat' : 'Döviz Al / Sat'}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">İşlem yapmak istediğiniz miktarı girin</p>
                      </div>
                      <button onClick={() => setInvestmentDetail(null)} className="w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600 transition-all">←</button>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Miktar</label>
                        <input type="number" placeholder="0" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-[#d32f2f] focus:outline-none" />
                      </div>
                    </div>

                    <button onClick={() => { alert('Yatırım işlemi başarıyla gerçekleştirildi!'); setActiveModal(null); setInvestmentDetail(null); }} className="w-full py-3.5 bg-[#d32f2f] hover:bg-[#b71c1c] text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-500/30">İşlemi Onayla</button>
                  </div>
                )}
              </div>
            )}

            {activeModal === 'islemler' && (
              <div>
                {islemDetail === null ? (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-xl font-black text-slate-800">Diğer İşlemler</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Fatura ödeyin veya şifrenizi değiştirin</p>
                      </div>
                      <button onClick={() => setActiveModal(null)} className="w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600 transition-all">✕</button>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div onClick={() => setIslemDetail('fatura')} className="p-5 bg-slate-50 hover:bg-red-50 border border-slate-200 rounded-2xl cursor-pointer transition-all flex justify-between items-center group">
                        <div>
                          <h4 className="font-extrabold text-slate-800 group-hover:text-[#d32f2f] text-sm">Fatura Öde</h4>
                          <p className="text-xs text-slate-400 mt-1">Elektrik, Su, Doğalgaz vb.</p>
                        </div>
                        <span className="text-lg font-black text-slate-700">📄</span>
                      </div>

                      <div onClick={() => setIslemDetail('sifre')} className="p-5 bg-slate-50 hover:bg-red-50 border border-slate-200 rounded-2xl cursor-pointer transition-all flex justify-between items-center group">
                        <div>
                          <h4 className="font-extrabold text-slate-800 group-hover:text-[#d32f2f] text-sm">Şifre Değiştir</h4>
                          <p className="text-xs text-slate-400 mt-1">6 haneli parolanızı güncelleyin</p>
                        </div>
                        <span className="text-lg font-black text-slate-700">🔑</span>
                      </div>
                    </div>

                    <button onClick={() => setActiveModal(null)} className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all">Kapat</button>
                  </div>
                ) : islemDetail === 'fatura' ? (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-xl font-black text-slate-800">Fatura Ödeme</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Kurum ve abone no bilgilerini girin</p>
                      </div>
                      <button onClick={() => setIslemDetail(null)} className="w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600 transition-all">←</button>
                    </div>

                    <form onSubmit={handlePayBill} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Fatura Tipi</label>
                        <select value={faturaTipi} onChange={(e) => setFaturaTipi(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-[#d32f2f] focus:outline-none">
                          <option value="Elektrik">Elektrik</option>
                          <option value="Su">Su</option>
                          <option value="Doğalgaz">Doğalgaz</option>
                          <option value="İnternet">İnternet</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Abone Numarası</label>
                        <input type="text" value={aboneNo} onChange={(e) => setAboneNo(e.target.value)} required placeholder="Örn: 12345678" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-[#d32f2f] focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tutar (TL)</label>
                        <input type="number" step="0.01" value={faturaTutar} onChange={(e) => setFaturaTutar(e.target.value)} required placeholder="0.00" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-[#d32f2f] focus:outline-none" />
                      </div>

                      <button type="submit" className="w-full py-3.5 bg-[#d32f2f] hover:bg-[#b71c1c] text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-500/30 mt-2">Faturayı Öde</button>
                    </form>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-xl font-black text-slate-800">Şifre Değiştir</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Mevcut ve yeni parolanızı girin</p>
                      </div>
                      <button onClick={() => setIslemDetail(null)} className="w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600 transition-all">←</button>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Mevcut Parola (6 Hane)</label>
                        <input type="password" maxLength="6" value={eskiSifre} onChange={(e) => setEskiSifre(e.target.value)} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-[#d32f2f] focus:outline-none tracking-widest" placeholder="••••••" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Yeni Parola (6 Hane)</label>
                        <input type="password" maxLength="6" value={yeniSifre} onChange={(e) => setYeniSifre(e.target.value)} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-[#d32f2f] focus:outline-none tracking-widest" placeholder="••••••" />
                      </div>

                      <button type="submit" className="w-full py-3.5 bg-[#d32f2f] hover:bg-[#b71c1c] text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-500/30 mt-2">Parolayı Güncelle</button>
                    </form>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}