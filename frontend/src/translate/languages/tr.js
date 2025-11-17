const messages = {
  tr: {
    translations: {
      common: {
        yes: "Evet",
        no: "Hayır",
        save: "Kaydet",
        cancel: "İptal",
        confirm: "Onayla",
        delete: "Sil",
        edit: "Düzenle",
        add: "Ekle",
        create: "Oluştur",
        update: "Güncelle",
        close: "Kapat",
        back: "Geri",
        next: "İleri",
        previous: "Önceki",
        search: "Ara",
        loading: "Yükleniyor...",
        noData: "Veri yok",
        error: "Hata",
        success: "Başarılı",
        warning: "Uyarı"
      },
      signup: {
        title: "Kayıt Ol",
        toasts: {
          success: "Kullanıcı başarılı bir şekilde oluşturuldu. Giriş Yapın!",
          fail: "Kullanıcı oluştururken hata oluştu."
        },
        form: {
          name: "Adınız",
          companyName: "Organizasyon Adı",
          email: "Eposta",
          phone: "Telefon",
          password: "Şifre"
        },
        buttons: {
          submit: "Kayıt",
          login: "Hesabınız var mı? Giriş Yapın."
        },
        recaptcha1: "This site is protected by reCAPTCHA and the Google",
        recaptcha2: "Privacy Policy",
        recaptcha3: "and",
        recaptcha4: "Terms of Service",
        recaptcha5: "apply."
      },
      passwordRecovery: {
        title: "Şifremi Unuttum",
        toasts: {
          success: "Eposta gönderildi, eposta adresinizi kontrol edin.",
          passwordUpdateSuccess: "Şifre Başarılı bir şekilde değiştirildi.",
          fail: "Şifre değiştirilirken hata oluştu. Tekrar deneyin."
        },
        form: {
          email: "Eposta",
          password: "Şifre",
          confirmPassword: "Şifre Tekrar",
          validation: "Şifrelerin eşleşmesi gerekiyor!"
        },
        buttons: {
          submit: "Gönder",
          login: "Giriş Yap"
        }
      },
      login: {
        title: "Giriş",
        form: {
          email: "Eposta",
          password: "Şifre"
        },
        buttons: {
          submit: "Gönder",
          register: "Hesabınız yok mu? Kayıt Ol!",
          recovery: "Şifremi Unuttum?"
        }
      },
      auth: {
        toasts: {
          success: "Giriş Başarılı!",
          active:
            "Hesap başarılı bir şekilde aktif edildi. Lütfen giriş yapın.",
          trialExpired: "Deneme süreniz bitti, bizimle iletişime geçiniz.",
          notActive:
            "Hesabınız aktif edilmedi, Lütfen eposta adresinizi doğrulayın."
        }
      },
      dashboard: {
        filters: {
          show: "Filtreleri Göster",
          hide: "Filtreleri Gizle",
        },
        filter: "FİLTRE ",
        tabs: {
          indicators: "Göstergeler",
          assessments: "NPS",
          attendants: "Temsilciler",
        },
        sections: {
          indicators: "Göstergeler",
          satisfactionSurvey: "Memnuniyet Anketi",
          attendances: "Görüşmeler",
          ratingIndex: "Değerlendirme Endeksi",
          attendants: "Temsilciler",
        },
        nps: {
          score: "Puan",
          promoters: "Tavsiye Edenler",
          neutrals: "Nötr",
          detractors: "Tavsiye Etmeyenler",
        },
        attendances: {
          total: "Toplam Görüşme",
          waitingRating: "Değerlendirme Bekleyen Görüşmeler",
          withoutRating: "Değerlendirilmemiş Görüşmeler",
          withRating: "Değerlendirilmiş Görüşmeler",
        },
        export: {
          attendantsReport: "TemsilciRaporu",
          attendantsReportFileName: "temsilci-raporu.xlsx",
        },
        cards: {
          inAttendance: "Görüşmede",
          waiting: "Beklemede",
          activeAttendants: "Aktif Temsilciler",
          finalized: "Tamamlandı",
          newContacts: "Yeni Kişiler",
          totalReceivedMessages: "Alınan Mesajlar",
          totalSentMessages: "Gönderilen Mesajlar",
          averageServiceTime: "Ort. Hizmet Süresi",
          averageWaitingTime: "Ort. Bekleme Süresi",
          status: "Durum (Mevcut)",
          activeTickets: "Aktif Biletler",
          passiveTickets: "Pasif Biletler",
          groups: "Gruplar",
        },
        users: {
          name: "Ad",
          numberAppointments: "Görüşme Sayısı",
          statusNow: "Mevcut",
          totalCallsUser: "Kullanıcı Başına Toplam Görüşme",
          totalAttendances: "Toplam Görüşmeler",
        },
        date: {
          initialDate: "Başlangıç Tarihi",
          finalDate: "Bitiş Tarihi",
        },
        licence: {
          available: "Şu tarihe kadar kullanılabilir",
        },
        assessments: {
          totalCalls: "Toplam Görüşmeler",
          callsWaitRating: "Değerlendirme Bekleyen Görüşmeler",
          callsWithoutRating: "Değerlendirilmemiş Görüşmeler",
          ratedCalls: "Değerlendirilmiş Görüşmeler",
          evaluationIndex: "Değerlendirme Endeksi",
          score: "Puan",
          prosecutors: "Tavsiye Edenler",
          neutral: "Nötr",
          detractors: "Tavsiye Etmeyenler",
        },
        charts: {
          perHour: {
            title: "Bugün - Sohbet Adeti: ",
            verticalTitle: "Sohbet"
          }
        }
      },
      connections: {
        title: "Bağlantı",
        toasts: {
          deleted: "WhatsApp bağlantısı başarılı bir şekilde silindi!"
        },
        confirmationModal: {
          deleteTitle: "Sil",
          deleteMessage:
            "Silmek istediğinize emin misiniz? Bu işlem geri döndürülemez.",
          disconnectTitle: "Bağlantı Yok!",
          disconnectMessage:
            "Emin misiniz? QR Kodu yeniden okutmanız gerekecek."
        },
        buttons: {
          add: "WhatsApp Ekle",
          disconnect: "Bağlantıyı Sonlandır",
          tryAgain: "Tekrar Deneyin",
          qrcode: "QR Kodu",
          newQr: "Yeni QR Kodu",
          connecting: "Bağlantıyı Oluştur",
          start: "Başla"
        },
        toolTips: {
          disconnected: {
            title: "WhatsApp oturumu başlatılamadı!",
            content:
              "Telefonun İnternet bağlantısı ve şarj seviyesinin düşük olmadığından emin olunuz. Ya da QR Kodu yeniden oluşturunuz."
          },
          qrcode: {
            title: "QR Kodu okumasını bekleyiniz.",
            content:
              "'QR Kodu' butonuna tıklayın ve telefonunuzdan QR Kodu okutarak oturumu başlatın."
          },
          connected: {
            title: "Bağlantı Kuruldu."
          },
          timeout: {
            title: "Telefonunuzla olan bağlantı koptu!",
            content:
              "Telefonun İnternet bağlantısından, WhatsApp'ın arka planda da çalışır olduğundan ve şarj seviyesinin düşük olmadığından emin olunuz. Ya da QR Kodu yeniden oluşturunuz."
          },
          offline: {
            title: "Bağlantı kapalı",
            content: "Online olmak için başlayın."
          }
        },
        table: {
          name: "İsim",
          number: "Numara",
          status: "Durum",
          provider: "WhatsApp",
          default: "Varsayılan",
          actions: "İşlem",
          session: "Oturum"
        }
      },
      whatsappModal: {
        title: {
          add: "WhatsApp Ekle",
          edit: "WhatsApp'ı düzenle"
        },
        form: {
          name: "İsim",
          onNewMessage: "Yeni Bir Mesajda",
          greetingMessage: "Karşılama Mesajı",
          farewellMessage: "Kapanış Mesajı",
          alwaysReopen: "Her zaman önceki konuşmayı yeniden aç",
          customReopen1: "Önceki konuşmayı",
          customReopen2: "dakikaya kadar yeniden aç",
          farewellTooltip: {
            title: "Sohbet Kapatıldıktan sonra gönderilecek mesaj",
            content:
              "Eklemek için aşağıdaki değişkenlere tıklayabilirsiniz. Göndermemek için boş bırakın"
          }
        },
        buttons: {
          okAdd: "Ekle",
          okEdit: "Kaydet",
          cancel: "İptal"
        },
        success: "WhatsApp başarılı bir şekilde kaydedildi."
      },
      qrCode: {
        message: "Oturumu başlatmak için QR Kodu okuyun."
      },
      fastResponses: {
        title: "Hızlı Yanıtlar",
        toasts: {
          deleted: "Hızlı yanıt başarılı bir şekilde silindi!"
        },
        confirmationModal: {
          deleteTitle: "Sil",
          deleteMessage: "Emin misiniz? Bu işlem geri döndürülemez."
        },
        buttons: {
          add: "Hızlı yanıt etkle"
        },
        table: {
          shortcut: "Kısayol",
          message: "Mesaj",
          actions: "Eylem"
        }
      },
      fastResponseModal: {
        title: {
          add: "Hızlı yanıt ekle",
          edit: "Hızlı yanıt düzenle"
        },
        form: {
          shortcut: "Kısayol",
          message: "Mesaj"
        },
        buttons: {
          okAdd: "Ekle",
          okEdit: "Kaydet",
          cancel: "İptal"
        },
        success: "Hızlı yanıt başarılı bir şekilde kaydedildi."
      },
      help: {
        title: "Yardım Merkezi"
      },
      contacts: {
        title: "Kişiler",
        toasts: {
          deleted: "Kişi Başarılı bir şekilde silindi!",
          not_imported_beta:
            "WhatsApp Beta'da kişileri içe aktarmak mümkün değil"
        },
        searchPlaceholder: "Ara ...",
        confirmationModal: {
          deleteTitle: "Sil",
          importTitlte: "Kişileri Yükle",
          deleteMessage:
            "Kişiyi silmek istediğinize emin misiniz? İlgili kişiye ait tüm sohbetler silinecektir.",
          importMessage:
            "Tüm Kişileri telefonunuzdan yüklemek istediğinize emin misiniz?"
        },
        newTicketModal: {
          title: "Yeni Konuşma",
          message: "Sohbete Başlamak için bağlantı oluştur."
        },
        buttons: {
          import: "Kişileri Çek",
          add: "Kişi Ekle"
        },
        table: {
          name: "İsim",
          whatsapp: "WhatsApp",
          email: "Eposta",
          actions: "İşlemler",
          wallet: "Cüzdan",
          status: "Durum",
          photo: "Fotoğraf",
          id: "Kimlik",
          lastMessage: "Son Mesaj"
        },
        menu: {
          importYourPhone: "Varsayılan cihazdan içe aktar",
          importToExcel: "Excel'den İçe/Dışa Aktar",
          importexport: "İÇE / DIŞA AKTAR",
          deleteAllContacts: "Tüm Kişileri Sil"
        },
        bulk: {
          selectAll: "Tüm kişileri seç",
          selected: "seçildi",
          allSelected: "(TÜMÜ)",
          deleteSelected: "Seçilenleri Sil",
          deleteAll: "Tümünü Sil",
          cancelSelection: "İptal",
          noSelection: "Silmek için en az bir kişi seçin"
        },
        modal: {
          profilePhoto: "Profil Fotoğrafı",
          imageUnavailable: "Görüntü mevcut değil",
          selectContact: "Kişi seç",
          blocked: "Engellendi",
          active: "Aktif",
          notAssigned: "Atanmamış",
          userNotFound: "Kullanıcı bulunamadı"
        }
      },
      contactModal: {
        title: {
          add: "Kişi Ekle",
          edit: "Kişi Düzenle"
        },
        form: {
          mainInfo: "İletişim Bilgileri",
          extraInfo: "Ek Bilgiler",
          name: "İsim",
          number: "Whatsapp numarası",
          email: "Eposta",
          extraName: "Alan Adı",
          extraValue: "Değeri",
          treatmentName: "İletişim Nedeni",
          verified: "Onaylı",
          notVerified: "Onaylı Değiş"
        },
        buttons: {
          addExtraInfo: "Ekstra Bilgi Ekle ",
          okAdd: "Ekle",
          okEdit: "Kaydet",
          cancel: "İptal"
        },
        success: "Kişi Başarılı bir şekilde kaydedildi."
      },
      queueModal: {
        title: {
          add: "Kuyruk Oluştur",
          edit: "Kuyruk Düzenle"
        },
        form: {
          options: "Ayarlar",
          option: "Ayar",
          name: "İsim",
          color: "Renk",
          greetingMessage: "Karşılama Mesajı",
          responseMessage: "Yanıt:"
        },
        optionsTooltip: {
          title: "ChatBot için ayarları ekle",
          content:
            "Tek bir seçenek varsa, otomatik olarak seçilecek ve botun seçenek mesajıyla yanıt vermesini sağlayacak."
        },
        greetingTooltip: {
          title:
            "Mesaj zorunlu alan, düzenlemek için tıkla! Message is required, click here to edit!",
          content: "Mesajsız bir seçenek seçilmeyecek."
        },
        buttons: {
          okAdd: "Ekle",
          okEdit: "Kaydet",
          cancel: "İptal",
          addOption: "Seçenek Ekle"
        },
        confirmationModal: {
          deleteTitle: "Seçeneği sil",
          deleteMessage: "Emin misiniz? Yapılan tüm seçenekler silinecek!"
        }
      },
      campaignModal: {
        title: {
          add: "Yeni Kampanya"
        },
        form: {
          name: "Kampanya Adı",
          connection: "Bağlantı",
          globalBody: "Varsayılan Mesaj",
          globalBodyTooltip:
            "Bu mesaj, tanımlanmış bir body'si olmayan CSV'deki içe aktarılan numaralara gönderilecektir."
        },
        buttons: {
          okAdd: "Ekle",
          okEdit: "Kaydet",
          cancel: "İptal"
        },
        success: "Kampanya Başarılı şekilde eklendi."
      },
      campaignProgressModal: {
        title: "Kampanya Mesajı",
        name: "Kampanya Adı",
        status: "Durum",
        table: {
          number: "Numara",
          message: "Mesaj",
          updatedAt: "Güncellendi",
          status: "Durum"
        },
        buttons: {
          back: "Geri"
        },
        ackLabels: {
          scheduled: "Ayarlandı",
          pending: "Gönderilmedi",
          sent: "Gönderildi",
          received: "Alındı",
          read: "Okundu"
        }
      },
      csvHandler: {
        downloadCsv: "Örnek Dosyayı İndir",
        importCsv: "CSV Dosyası Yükle"
      },
      userModal: {
        title: {
          add: "Kullanıcı Ekle",
          edit: "Kullanıcı Düzenle"
        },
        form: {
          name: "Ad",
          email: "Eposta",
          password: "Şifre",
          profile: "Profil"
        },
        buttons: {
          okAdd: "Ekle",
          okEdit: "Kaydet",
          cancel: "İptal"
        },
        success: "Kullanıcı başarılı bir şekilde kaydedildi."
      },
      chat: {
        noTicketMessage:
          "Sohbete Başlamak için, herhangi bir sohbet kabul edin veya başlatın."
      },
      ticketsManager: {
        buttons: {
          newTicket: "Yeni"
        }
      },
      multipleSelectField: {
        selectAll: "Tümünü seç"
      },
      ticketsFilter: {
        applyFilters: "Uygula",
        cleanFilters: "Temizle",
        found: "Bulundu",
        placeholders: {
          search: "İsime veya numaraya göre ara",
          queues: "Kuyruklar",
          noQueue: "Sıra",
          whatsapps: "WhatsApp'lar",
          noWhatsapp: "Ne whatsapp",
          users: "Kullanıcılar",
          noUser: "Cevapsız",
          status: "Durumlar",
          protocol: "Protokol",
          tags: "Etiketler",
          dateFrom: "Başlangıç",
          dateTo: "Bitiş",
          pending: "Beklemek",
          open: "Katılmak",
          closed: "Çözüldü"
        }
      },
      ticketTagManager: {
        addTags: "Etiket Ekle",
        add: "Ekle",
        typeToAdd: "Yeni Etiket Yaz",
        confirmationModal: {
          deleteTitle: "Etiket Sil",
          deleteMessage:
            "Emin misiniz? Bu etiket ilgili tüm konuşmalardan silinecek!"
        }
      },
      referral: {
        title: "Referans Programı",
        link: "Referans Bağlantısı"
      },
      subscription: {
        title: "Abonelik",
        details: "Abonelik Detayları",
        billingEmail: "Fatura Eposta",
        unverifiedEmail1: "Bu eposta onaylanmamış, ",
        unverifiedEmailClick: "Buraya Tıkla ",
        unverifiedEmail2: "Aktivasyon mailini yeniden almak için.",
        status: {
          trial: "Deneme",
          active: "Aylık Abone",
          suspended: "Aboneliğin süresi doldu!"
        },
        expirationMessage: {
          trialExpiringIn: "Deneme sürenizin bitmesine {{count}} gün kaldı!!",
          trialExpiringIn_plural:
            "Deneme süreniz {{count}} gün içinde sona eriyor!",
          trialExpired:
            "Deneme süresi doldu, Kullanmak için aboneliğinizi yenileyin!",
          subscriptionCycleExpiring: "Mevcut aboneliğiniz sona eriyor."
        },
        planTable: {
          header: {
            plan: "Plan",
            users: "Kullanıcılar",
            whatsapps: "Whatsapplar",
            total: "Toplam",
            lastInvoice: "Son Fatura"
          },
          planName: "Özel"
        },
        buttons: {
          subscribe: "Abone Ol!",
          edit: "Değiştir",
          close: "Sonlandır"
        },
        tooltip: {
          billingCycle: {
            title: "Bir sonraki faturanızın son ödeme tarihi",
            content:
              "Fatura son ödeme tarihinden 10 gün önce düzenlenir. Aşağıdaki 'Son fatura' düğmesi aracılığıyla veya fatura e-postanız aracılığıyla faturaya erişin."
          }
        }
      },
      changeEmailModal: {
        title: "Fatura epostasını değiştirin",
        placeholder: "Yeni eposta",
        toast: "Yeni bir onay maili eposta adresinize gönderildi.",
        buttons: {
          ok: "Değiştir",
          cancel: "İptal"
        }
      },
      checkoutStepper: {
        titleEdit: "Planı Değiştir",
        titlePending: "Neredeyse Hazır!",
        titleDone: "Aboneliğiniz için Teşekkürler!",
        steps: {
          billingData: "Veri",
          customize: "Özelleştir",
          review: "Gözden Geçir",
          success: "Tebrikler!"
        },
        messages: {
          toastMinimumPlan: "En az 3 kullanıcı ve 1 whatsapp numarası gerekli",
          fieldMinimumUsers: "En Az 3!",
          fieldMinimumWhats: "En az 1!",
          emailSent:
            "Fatura adresine ödeme talimatı içeren bir e-posta gönderildi.",
          activationInfo:
            "Kredi kartı ödemeleri anında etkinleştirilir. Daha fazla yardıma ihtiyacınız olursa bizimle iletişime geçmekten çekinmeyin.",
          planChanged: "Aboneliğiniz güncellendi!",
          planChangedInfo:
            "Yeni kullanıcılar ve whatsapp limiti zaten mevcut. Yeni değer, bir sonraki açık faturanızda tahsil edilecektir."
        },
        buttons: {
          payNow: "Öde!",
          close: "Kapat"
        }
      },
      billingData: {
        title: "Gerekli Bilgiler",
        form: {
          name: "İsim",
          document: "Döküman Numarası",
          zip: "Posta Kodu",
          street: "Sokak",
          number: "Numara",
          district: "İlçe",
          complement: "Adres",
          city: "İl",
          state: "Ülke"
        }
      },
      planBuilder: {
        title: "Aboneliğinizi özelleştirin",
        table: {
          header: {
            item: "Ürün",
            quantity: "Miktar",
            unitaryValue: "Değer",
            subtotal: "Ara Toplam"
          },
          users: "Kullanıcılar",
          whatsapps: "Whatsapp'lar",
          total: "Toplam"
        },
        buttons: {
          next: "Sıradaki"
        }
      },
      subscriptionReview: {
        title: "Abonelik Özeti",
        titleChange: "Uyarı! Değişiklik 30 gün içerisinde değiştirilemez!",
        whatsExceeded:
          "Dikkat! Şu anda kullandığınızdan daha az whatsapp'a ayarlıyorsunuz. Fazla bağlantılar silinecek.",
        planDetails: "Plan Detayları",
        paymentDetails: "Ödeme Bilgisi",
        email: "Eposta",
        users: "Kullanıcılar",
        whatsapps: "Whatsapplar",
        name: "İsim",
        address: "Adres",
        document: "Döküman",
        total: "Toplam",
        buttons: {
          subscribe: "Abone Ol ",
          change: "Değişikliği Onayla",
          back: "Geri"
        }
      },
      tickets: {
        toasts: {
          deleted: "Oluşturulan sohbet silindi."
        },
        notification: {
          message: "Gelen Mesaj"
        },
        tabs: {
          open: { title: "Açık" },
          closed: { title: "Kapalı" },
          search: { title: "Ara" }
        },
        buttons: {
          showAll: "Tüm"
        }
      },
      transferTicketModal: {
        title: "Sohbeti Transfer Et",
        fieldLabel: "Kullanıcı Ara",
        noOptions: "Bu isimde Kullanıcı Bulunamadı.",
        noteLabel: "Gözlemler",
        buttons: {
          ok: "Transfer",
          cancel: "İptal"
        }
      },
      ticketsList: {
        pendingHeader: "Kuyruktakiler",
        assignedHeader: "İlgilenilenler",
        noTicketsTitle: "Boş!",
        noTicketsMessage: "Aranan terimle alakalı hiçbir şey bulunamadı.",
        buttons: {
          accept: "Kabul Et"
        },
        confirmationModal: {
          title: "Otomatik Yanıtlama",
          message:
            "Bu konuşma otomatik yanıtlamada. Kabul etmek, otomatik yanıtlamanın kesilmesine neden olur."
        },
        status: {
          closed: "Kapandı"
        }
      },
      ticketListItem: {
        assignedTo: "İlgilenen",
        waitingWarning: "5 dakikadan fazla bekliyor!",
        noQueue: "sıra yok",
        connectionTooltip: {
          title: "Bir bağlantı seçmek için tıklayın"
        },
        chatbotTooltip: {
          title: "Otomatik Yanıtlama"
        },
        selectWhatsModal: {
          title: "Bu görüşmenin bağlantısı yok",
          message: "Sohbete devam etmek için bir bağlantı seçin",
          applyToAll: "Bağlantı olmadan herkese uygula"
        }
      },
      newTicketModal: {
        title: "Sohbet Oluştur",
        fieldLabel: "Kişileri Ara",
        queues: "Kuyruklar",
        noQueue: "Boş",
        add: "Ekle",
        buttons: {
          ok: "Başla",
          cancel: "İptal"
        }
      },
      whatsappSelect: {
        label: "Bağlantı Seç*"
      },
      mainDrawer: {
        listItems: {
          dashboard: "Pano",
          connections: "Bağlantılar",
          chatsTempoReal: "Gerçek Zamanlı Panel",
          tickets: "Sohbetler",
          quickMessages: "Hızlı Yanıtlar",
          contacts: "Kişiler",
          wallets: "Cüzdanlar",
          queues: "Kuyruklar & Chatbotlar",
          tags: "Etiketler",
          administration: "Yönetim",
          companies: "Şirketler",
          users: "Kullanıcılar",
          settings: "Ayarlar",
          files: "Dosya Listesi",
          helps: "Yardım Merkezi",
          messagesAPI: "API",
          schedules: "Zamanlamalar",
          campaigns: "Kampanyalar",
          annoucements: "Duyurular",
          chats: "Dahili Sohbet",
          financeiro: "Finansal",
          queueIntegration: "Entegrasyonlar",
          version: "Sürüm",
          kanban: "Kanban",
          prompts: "Talk.AI",
          allConnections: "Bağlantıları Yönet",
          reports: "Raporlar",
          management: "Yönetim",
        },
        submenuLabels: {
          flowbuilder: "Otomasyon Akışı",
          flowCampaign: "Kampanya Akışı",
          flowConversation: "Konuşma Akışı",
        },
        tooltips: {
          expandMenu: "Menüyü genişlet",
          collapseMenu: "Menüyü daralt",
        },
        campaigns: {
          subMenus: {
            list: "Liste",
            listContacts: "Kişi Listesi",
            settings: "Ayarlar",
          },
        },
        contactLists: {
          title: "İletişim Listeleri",
          table: {
            name: "İsim",
            contacts: "Kişiler",
            actions: "İşlemler",
          },
          buttons: {
            add: "Yeni Liste",
            downloadExample: "Örnek Tabloyu İndir",
            viewContacts: "Kişileri Görüntüle",
            edit: "Düzenle",
            delete: "Sil",
          },
          dialog: {
            name: "İsim",
            company: "Şirket",
            okEdit: "Düzenle",
            okAdd: "Ekle",
            add: "Ekle",
            edit: "Düzenle",
            cancel: "İptal",
          },
          confirmationModal: {
            deleteTitle: "Sil",
            deleteMessage: "Bu işlem geri alınamaz.",
          },
          toasts: {
            deleted: "Kayıt başarıyla silindi.",
          },
        },
        contactListItems: {
          title: "Kişiler",
          searchPlaceholder: "Ara",
          buttons: {
            add: "Yeni",
            lists: "Listeler",
            import: "İçe Aktar",
          },
          dialog: {
            name: "İsim",
            number: "Numara",
            whatsapp: "WhatsApp",
            email: "E-posta",
            okEdit: "Düzenle",
            okAdd: "Ekle",
            add: "Ekle",
            edit: "Düzenle",
            cancel: "İptal",
          },
          table: {
            name: "İsim",
            number: "Numara",
            whatsapp: "WhatsApp",
            email: "E-posta",
            actions: "İşlemler",
          },
          confirmationModal: {
            deleteTitle: "Sil",
            deleteMessage: "Bu işlem geri alınamaz.",
            importMessage: "Bu tablodaki kişileri içe aktarmak istiyor musunuz?",
            importTitle: "İçe Aktar",
          },
          toasts: {
            deleted: "Kayıt başarıyla silindi.",
          },
        },
        kanban: {
          title: "Kanban",
          searchPlaceholder: "Ara",
          subMenus: {
            list: "Pano",
            tags: "Şeritler",
          },
          sortOrder: "Sıralama",
          ticketNumber: "Bilet Numarası",
          lastMessage: "Son Mesaj",
          valueDesc: "Değer (yüksekten düşüğe)",
          startDate: "Başlangıç tarihi",
          endDate: "Bitiş tarihi",
          search: "Ara",
          addColumns: "+ Sütun ekle",
          ticketPrefix: "Bilet no",
          assignValue: "Değer Ata",
          value: "Değer",
          remove: "Kaldır",
          viewTicket: "Bileti Görüntüle",
          editValue: "Düzenle",
          saveValue: "Kaydet",
          cancel: "İptal",
          opportunityValue: "Fırsat Değeri",
          total: "Toplam",
          ticketUpdatedSuccess: "Bilet Etiketi başarıyla güncellendi!",
          ticketRemovedSuccess: "Bilet Etiketi kaldırıldı!",
        },
        appBar: {
          user: {
            profile: "Profil",
            logout: "Çıkış"
          }
        }
      },
      notifications: {
        noTickets: "Bildirim Yok."
      },
      quickMessages: {
        title: "Hızlı Yanıtlar",
        searchPlaceholder: "Ara...",
        noAttachment: "Ek yok",
        confirmationModal: {
          deleteTitle: "Sil",
          deleteMessage: "Bu işlem geri alınamaz! Devam etmek istiyor musunuz?",
        },
        selectMessage: "Hızlı Yanıt Seç",
        hasMedia: "Medya ile",
        global: "Genel",
        noResultsFound: "Aramanız için hızlı yanıt bulunamadı",
        noQuickMessages: "Kullanılabilir hızlı yanıt yok",
        buttons: {
          add: "Ekle",
          attach: "Dosya Ekle",
          cancel: "İptal",
          edit: "Düzenle",
        },
        toasts: {
          success: "Kısayol başarıyla eklendi!",
          deleted: "Kısayol başarıyla kaldırıldı!",
        },
        validation: {
          required: "Zorunlu",
        },
        dialog: {
          title: "Hızlı Mesaj",
          shortcode: "Kısayol",
          message: "Yanıt",
          save: "Kaydet",
          cancel: "İptal",
          general: "Genel",
          geral: "Düzenlemeye İzin Ver",
          add: "Ekle",
          edit: "Düzenle",
          visao: "Görüntülemeye İzin Ver",
          attachMedia: "Medya Ekle",
          editMedia: "Medyayı düzenle",
          removeMedia: "Medyayı kaldır",
          newFile: "Yeni Dosya",
          newAudioRecorded: "Yeni kaydedilmiş ses",
          newAudio: "Yeni Ses",
          chooseNewMediaToReplace: "Değiştirmek için yeni medya seçin:",
          chooseMediaOption: "Medya eklemek için bir seçenek belirleyin:",
          attachFile: "Dosya Ekle",
          recordAudio: "Ses Kaydet",
          cancelEdit: "Düzenlemeyi İptal Et",
          type: "Tür",
          value: "Değer",
          status: "Durum",
          language: "Dil",
          category: "Kategori",
          metaID: "Meta ID",
        },
        table: {
          shortcode: "Kısayol",
          message: "Mesaj",
          actions: "İşlemler",
          mediaName: "Dosya Adı",
          status: "Durum",
          media: "Medya",
        },
      },
      queues: {
        title: "Kuyruklar",
        deleteQueue: "Sıra başarıyla silindi.",
        saveQueue: "Sıra başarıyla kaydedildi!",
        table: {
          name: "İsim",
          color: "Renk",
          greeting: "Karşılama mesajı",
          actions: "İşlemler"
        },
        buttons: {
          add: "Kuyruk Ekle"
        },
        confirmationModal: {
          deleteTitle: "Sil",
          deleteMessage:
            "Silmek istediğinize emin misiniz? Bu kuyruktaki sohbetler hala var olacak, ancak atanmışlar herhangi bir sıraya sahip olmayacak!"
        }
      },
      queueSelect: {
        inputLabel: "Kuyruklar"
      },
      users: {
        title: "Kullanıcılar",
        table: {
          name: "İsim",
          email: "Eposta",
          profile: "Profil",
          actions: "İşlemler",
          no_data: "Veri yok"
        },
        buttons: {
          add: "Kullanıcı Ekle"
        },
        toasts: {
          deleted: "Kullanıcı Başarılı bir şekilde silindi."
        },
        confirmationModal: {
          deleteTitle: "Sil",
          deleteMessage:
            "Tüm kullanıcı verileri silinecek. Kullanıcıların açık sohbetleri kuyruğa taşınacaktır."
        },
        totalCountUsers: "Toplam Kullanıcılar :"
      },
      campaigns: {
        title: "Kampanyalar",
        table: {
          name: "Kampanya Adı",
          status: "Durum",
          createdAt: "Oluşturulma Zamanı",
          connection: "Bağlantı",
          progress: "İlerleme",
          actions: "İşlem"
        },
        not_connection: "Bağlantı Yok",
        status: {
          concluded: "Tamamlandı",
          suspended: "Askıda",
          active: "Aktif"
        },
        buttons: {
          add: "Yeni Kampanya"
        },
        toasts: {
          created: "Kampanya başarılı bir şekilde oluşturuldu!",
          started: "Kampanya başarılı bir şekilde başladı!",
          suspended: "Kampanya başarılı bir şekilde durduruldu!"
        },
        remainingMessages: "Kalan Mesajlar :"
      },
      settings: {
        success: "Ayarlar başarılı bir şekilde kaydedildi!",
        title: "Ayarlar",
        tabs: {
          options: "Seçenekler",
          companies: "Şirketler",
          plans: "Planlar",
          helps: "Yardım"
        },
        settings: {
          language: "Otomatik olarak oluşturulan mesajların dili",
          timezone: "Zaman dilimi",
          options: {
            disabled: "Devre Dışı",
            enabled: "Etkin",
            updating: "Güncelleniyor...",
            creationCompanyUser: "Şirket/Kullanıcı Oluşturma",
            evaluations: "Değerlendirmeler",
            officeScheduling: "Ofis Zamanlaması",
            queueManagement: "Kuyruk Yönetimi",
            companyManagement: "Şirket Yönetimi",
            connectionManagement: "Bağlantı Yönetimi",
            sendGreetingAccepted: "Bileti Kabul Ederken Selamlama Gönder",
            sendMsgTransfTicket: "Departman/Temsilci Arasında Transfer Mesajı Gönder",
            checkMsgIsGroup: "Grup Mesajlarını Yoksay",
            chatBotType: "Bot Tipi",
            userRandom: "Rastgele Temsilci Seçimi",
            buttons: "Butonlar",
            acceptCallWhatsapp: "WhatsApp aramasının kabul edilmediğini bildir?",
            sendSignMessage: "Temsilcinin İmza göndermeyi seçmesine izin ver",
            sendGreetingMessageOneQueues: "Sadece bir kuyruk olduğunda selamlama gönder",
            sendQueuePosition: "Kuyruk Konumu Mesajı Gönder",
            sendFarewellWaitingTicket: "Beklerken Veda Mesajı Gönder",
            acceptAudioMessageContact: "Tüm Kişilerden Sesli Mesaj Kabul Et?",
            enableLGPD: "KVKK İşlemeyi Etkinleştir",
            requiredTag: "Bileti Kapatmak için Gerekli Etiket",
            closeTicketOnTransfer: "Başka Kuyruğa Transfer Ederken Bileti Kapat",
            DirectTicketsToWallets: "Müşteriyi Otomatik Olarak Cüzdana Taşı",
            showNotificationPending: "Bekleyen Biletler için Bildirim Göster",
            copyContactPrefix: "Kişi Kopyalama Öneki",
            copyContactPrefixPlaceholder: "Ör: KOPYA_",
            schedules: "Zamanlamalar",
            configurationPix: "Pix Efí Yapılandırması (GerenciaNet)",
            mercadoPago: "Mercado Pago",
            stripe: "Stripe",
            asaas: "ASAAS",
            clientId: "Client ID",
            clientSecret: "Client Secret",
            pixKey: "PIX Anahtarı",
            accessToken: "Access Token",
            stripePrivateKey: "Stripe Private Key",
            asaasToken: "Asaas Token",
            configurationCopyPrefix: "Kişi Kopyalama Öneki Yapılandırması",
            successOperation: "İşlem başarıyla güncellendi.",
            text: "Metin",
            finalizationAttendance: "Hizmet Sonlandırma"
          },
          customMessages: {
            sendQueuePositionMessage: "Kuyruk Konumu Mesajı",
            AcceptCallWhatsappMessage: "Aramanın Kabul Edilmediğini Bildirme Mesajı",
            greetingAcceptedMessage: "Bileti Kabul Ederken Selamlama Mesajı",
            transferMessage: "Transfer Mesajı - ${queue.name} = hedef kuyruk"
          },
          LGPD: {
            title: "KVKK",
            welcome: "Hoş Geldiniz Mesajı (KVKK)",
            linkLGPD: "Gizlilik Politikası Bağlantısı",
            obfuscateMessageDelete: "Silinen Mesajı Gizle",
            alwaysConsent: "Her Zaman Onay İste",
            obfuscatePhoneUser: "Kullanıcı Telefon Numarasını Gizle",
            enabled: "Etkin",
            disabled: "Devre Dışı"
          }
        }
      },
      messagesList: {
        header: {
          assignedTo: "İlgilenen :",
          buttons: {
            return: "Kuyruğa Al",
            resolve: "Kapat",
            reopen: "Yeniden Aç",
            accept: "Kabul"
          }
        }
      },
      contactMessage: {
        add: "Ekle"
      },

      messageMedia: {
        loading: "Yükleniyor..."
      },
      messagesInput: {
        maxUploadSize: "Yüklenen dosya 20 MB sınırını aşıyor",
        placeholder: {
          open: "Hızlı yanıt vermek için bir mesaj veya ' / ' yazın",
          closed: "Mesaj göndermek için bu bileti yeniden açın veya kabul edin",
          note: "Özel not ekle"
        },
        signMessage: "Unvan",
        dragAndDrop: "Dosya eklemek için sürükleyip bırakın",
        tooltips: {
          sendNote: "Özel not",
          sendMessage: "Açık Mesaj"
        }
      },
      contactDrawer: {
        header: "Kullanıcı Detayları",
        buttons: {
          edit: "Kullanıcı Düzenle"
        },
        extraInfo: "Diğer Bilgiler"
      },
      ticketOptionsMenu: {
        delete: "Sil",
        transfer: "Transfer",
        confirmationModal: {
          title: "Sohbeti Sil #",
          message: "Dikkat! Konuşmayla ilgili tüm mesajlar kaybolacak."
        },
        buttons: {
          delete: "Sil",
          cancel: "İptal"
        }
      },
      confirmationModal: {
        buttons: {
          confirm: "Tamam",
          cancel: "İptal"
        }
      },
      messageOptionsMenu: {
        delete: "Sil",
        reply: "Yanıtla",
        confirmationModal: {
          title: "Mesajı Sil?",
          message: "Bu işlem geri döndürülemez."
        }
      },
      maxUsersModal: {
        title: "Maksimum eşzamanlı kullanıcıya ulaşıldı!",
        subtitle:
          "Mevcut çevrimiçi kullanıcılar sözleşmeli kullanıcıları aştı, uygulamayı kullanmaya devam etmek için bir kullanıcının bağlantısını kesin.",
        table: {
          name: "İsim",
          lastSeen: "Son Görülme"
        },
        buttons: {
          disconnect: "Bağlantıyı Kes",
          logout: "Çıkış"
        },
        confirmationModal: {
          title: "Emin misiniz?",
          message: "Bağlantınız kesilecek."
        }
      },
      reports: {
        title: "Hizmet Raporları",
        startDate: "Başlangıç Tarihi",
        endDate: "Bitiş Tarihi",
        table: {
          id: "Bilet",
          user: "Kullanıcı",
          dateOpen: "Açılış Tarihi",
          dateClose: "Kapanış Tarihi",
          NPS: "NPS",
          status: "Durum",
          whatsapp: "Bağlantı",
          queue: "Kuyruk",
          actions: "İşlemler",
          lastMessage: "Son Mesaj",
          contact: "Müşteri",
          supportTime: "Hizmet Süresi",
          valorVenda: "Satış Değeri",
          motivoNaoVenda: "Satış Yapılmama Nedeni",
          finalizadoComVenda: "Satışla Sonuçlandı",
          wallet: "Cüzdan",
          ticketsPerPage: "Sayfa başına bilet",
        },
        buttons: {
          filter: "Filtre Uygula",
          onlyRated: "Sadece Değerlendirilenler",
          exportExcel: "Excel'e Aktar",
        },
        searchPlaceholder: "Ara...",
        tooltips: {
          logsTicket: "Bilet Kayıtları",
          accessTicket: "Bilete Eriş",
          exportExcel: "Excel'e Aktar",
        },
        exportExcel: {
          title: "Hizmet Raporları",
          startDate: "Başlangıç tarihi",
          endDate: "Bitiş tarihi",
          notInformed: "Bilgi verilmedi",
          columns: {
            id: "ID",
            connection: "Bağlantı",
            contact: "Kişi",
            user: "Kullanıcı",
            queue: "Kuyruk",
            status: "Durum",
            lastMessage: "Son Mesaj",
            openDate: "Açılış Tarihi",
            openTime: "Açılış Saati",
            closeDate: "Kapanış Tarihi",
            closeTime: "Kapanış Saati",
            supportTime: "Destek Süresi",
            nps: "NPS",
            valorVenda: "Satış Değeri",
            motivoNaoVenda: "Satış Yapılmama Nedeni",
            finalizadoComVenda: "Satışla Sonuçlandı",
          },
        },
        finalizadoComVenda: {
          sim: "Evet",
          nao: "Hayır",
        },
      },
      wallets: {
        wallet: "Cüzdan",
      },
      copyToClipboard: {
        copy: "Kopyala",
        copied: "Kopyalandı!"
      },
      retryMessageIcon: {
        error: "Mesaj gönderilirken hata oluştu. Yeniden denemek için tıklayın",
        loading: "Mesaj yeniden gönderiliyor..."
      },
      scheduledMessageIcon: {
        tooltip: "API'den gönderilmek üzere planlanmış mesaj"
      },
      sentFromApiIcon: {
        tooltip: "API'dan gönderildi"
      },
      messageVariablesPicker: {
        label: "Kullanılabilir Değişkenler",
        vars: {
          contactTreatment: "Kişi Sorunu",
          contactName: "Kişi İsmi",
          protocolNumber: "Protokol Numarası",
          contactNumber: "Kişi Numarası",
          greeting: "Karşılama"
        }
      },
      tokens: {
        title: "API Tokens",
        subtitle: "API Tokenlarını yönet",
        description:
          "Uygulama ile entegre etmek için tokenları kullanabilirsiniz. Bu API'yi kullanma hakkında daha fazla bilgi için Dokümanlar'ı ziyaret edin",
        table: {
          name: "İsim",
          secret: "Anahtar",
          actions: "İşlemler"
        },
        toasts: {
          tokenDeleted: "Token başarılı bir şekilde silindi!"
        },
        confirmationModal: {
          title: "Emin misiniz?",
          content:
            "Bu token'ı kullanan tüm sistemler yeniden yapılandırılmalıdır, aksi takdirde artık çalışmayacaktır.."
        },
        buttons: {
          new: "Yeni token"
        }
      },
      apiTokenModal: {
        title: "Token",
        name: "İsim",
        secret: "Anahtar",
        permissions: "İzinler",
        buttons: {
          save: "Kaydet",
          cancel: "İptal"
        },
        toasts: {
          noPermissions: "En az bir izin gereklidir.",
          success: "Token başarılı bir şekilde oluşturuldu!"
        }
      },
      initialConfig: {
        title: "İlk ayar",
        content1: "Whaticket 😊'a Hoşgeldiniz",
        content2:
          "Bunu kolaylaştırmak için * Hayatın, otomatik bir başlangıç ​​konfigürasyonu sağlıyoruz, böylece tüm Whaticket * * İnanılmaz * özelliklerini birkaç dakika içinde test edebilirsiniz.",
        content3:
          "* Tamam * tıklatarak, bir miktar * kuyruklar *, * chatbots *, * Hızlı Yanıtlar *, * Etiketler * ve A * WhatsApp bağlantısını oluşturalım. Bundan sonra, sadece sayfa * bağlantılardaki * QR kodunu * okuyun * bağlantılar * Testlere başlamak için. ",
        content4:
          "Bağlı sayıda ilk mesajı alır almaz, Whaticket eyleme geçecektir. 😎",
        content5:
          "Bütün bunları tek başına nasıl ayarlayacağınızı bilmek istiyorsanız, * Yardım * sayfasındaki videoları izleyebilir veya * Destek * ile temasa geçebilirsiniz.",
        content6: "İyi Testler! 🥰🥰"
      },
      languages: {
        undefined: "Dilim",
        "pt-BR": "Português",
        es: "Español",
        en: "English",
        tr: "Türkçe"
      },
      messagesAPI: {
        title: "API",
        toSend: "GÖNDER",
        send: "Gönder",
        textMessage: {
          number: "Numara",
          body: "Mesaj",
          token: "Kayıtlı Token",
          userId: "Kullanıcı/Agent ID",
          queueId: "Kuyruk ID",
        },
        mediaMessage: {
          number: "Numara",
          body: "Dosya Adı",
          media: "Dosya",
          token: "Kayıtlı Token",
        },
        forbiddenMessage: "Bu şirketin bu sayfaya erişim izni yok! Sizi yönlendiriyoruz.",
        successMessage: "Mesaj başarıyla gönderildi",
        API: {
          title: "Mesaj Gönderme Dokümantasyonu",
          methods: {
            title: "Gönderme Yöntemleri",
            messagesText: "Metin Mesajları",
            messagesMidia: "Medya Mesajları",
          },
          instructions: {
            title: "Talimatlar",
            comments: "Önemli Notlar",
            comments1:
              "Mesaj göndermeden önce, mesajları gönderecek bağlantıya bağlı token'ı kaydetmek gereklidir. <br />Kayıt olmak için 'Bağlantılar' menüsüne erişin, bağlantıdaki düzenle düğmesine tıklayın ve token'ı uygun alana ekleyin.",
            comments2:
              "Gönderim numarası maskesiz veya özel karaktersiz olmalı ve şunlardan oluşmalıdır:",
            codeCountry: "Ülke Kodu",
            code: "Alan Kodu",
            number: "Numara",
          },
          text: {
            title: "1. Metin Mesajları",
            instructions:
              "Metin mesajları göndermek için gerekli bilgilerin listesi aşağıdadır:",
          },
          media: {
            title: "2. Medya Mesajları",
            instructions:
              "Medya mesajları göndermek için gerekli bilgilerin listesi aşağıdadır:",
            endpoint: "Endpoint:",
            method: "Yöntem:",
            headers: "Başlıklar:",
            formData: "FormData:",
            file: "dosya",
          },
        },
      },
      messagesAPIInstructions: {
        endpoint: "Endpoint:",
        method: "Yöntem:",
        post: "POST",
        headers: "Başlıklar:",
        headerAuthorization:
          "Authorization Bearer (kayıtlı token) ve Content-Type (application/json)",
        body: "Body:",
        fieldNumber: '"number": "905399999999"',
        fieldBody: '"body": "Mesaj"',
        fieldUserId: '"userId": Kullanıcı ID veya ""',
        fieldQueueId: '"queueId": Kuyruk ID veya ""',
        fieldSendSignature: '"sendSignature": Mesajı imzala - true/false',
        fieldCloseTicket: '"closeTicket": Bileti kapat - true/false',
        singMessage: "Mesajı imzala - true/false",
        closeTicket: "Bileti kapat - true/false",
        testSend: "Test Gönderimi",
      },

      errorFallback: {
        error: "Uups, birşeyler yanlış gitti!",
        instructions: "Lütfen F5 yaparak sayfayı yenileyin ve tekrar deneyin!"
      },
      serviceWorker: {
        toast: "Yeni versiyon mevcut. Güncellemek için Tıklayın!"
      },
      backendErrors: {
        ERR_NO_OTHER_WHATSAPP:
          "En az bir tane WhatsApp bağlantısı olmak zorunda.",
        ERR_NO_DEF_WAPP_FOUND:
          "Varsayılan bir WhatsApp Hesabı bulunamadı. Lütfen Bağlantı sayfasını kontrol edin.",
        ERR_WAPP_NOT_INITIALIZED:
          "WhatsApp Oturumu başlatılamadı. Lütfen Bağlantı sayfasını kontrol edin.",
        ERR_WAPP_CHECK_CONTACT:
          "WhatsApp kişileri getirilemedi. Lütfen Bağlantı sayfasını kontrol edin.",
        ERR_WAPP_INVALID_CONTACT: "Bu uygun bir WhatsApp numarası gözükmüyor.",
        ERR_WAPP_DOWNLOAD_MEDIA:
          "Medya indirilemedi. Lütfen Bağlantı sayfasını kontrol edin.",
        ERR_INVALID_CREDENTIALS: "Doğrulama Hatası. Lütfen Tekrar deneyiniz.",
        ERR_SENDING_WAPP_MSG:
          "Mesaj gönderilirken hata oluştu. Lütfen Bağlantı sayfasını kontrol edin.",
        ERR_DELETE_WAPP_MSG: "Mesaj Silinemiyor!",
        ERR_OTHER_OPEN_TICKET:
          "Bu kişi ile zaten açık bir sohbetiniz bulunmakta.",
        ERR_SESSION_EXPIRED: "Oturum sonlandı. Lütfen Giriş Yapın.",
        ERR_USER_CREATION_DISABLED:
          "Kullanıcı oluşturulması yönetici tarafından engellendi.",
        ERR_NO_PERMISSION: "Bu kaynağa erişmek için yetkiniz yok.",
        ERR_DUPLICATED_CONTACT: "Bu numaraya ait bir kişi zaten mevcut.",
        ERR_NO_SETTING_FOUND: "Bu ID'ye ait bir ayar bulunamadı!",
        ERR_NO_CONTACT_FOUND: "Bu ID'ye ait bir kişi bulunamadı!",
        ERR_DUPLICATED_EMAIL: "Bu eposta zaten kayıtlı!",
        ERR_NO_TICKET_FOUND: "Bu ID'ye aiit bir sohbet bulunamadı!",
        ERR_NO_USER_FOUND: "Bu ID'ye ait bir kullanıcı bulunamadı!",
        ERR_DIFFERENT_PASSWORDS: "Farklı Şifreler",
        ERR_RECOVERY_EXPIRED: "Yenileme süresi doldu.",
        ERR_NO_EMAIL_FOUND: "Bu Eposta ile kullanıcı bulunamadı.",
        ERR_NO_WAPP_FOUND: "Bu ID ile WhatsApp bulunamadı.",
        ERR_CREATING_MESSAGE: "Veritabanında mesaj oluşturulurken hata oluştu.",
        ERR_MAX_WHATS_REACHED:
          "İzin verilen maksimum whatsapp hesaplarına ulaşıldı, satış ekibiyle iletişime geçin.",
        ERR_MAX_WHATS_EXCEEDED:
          "İzin verilen maksimum whatsapp hesabı aşıldı! Uygulamayı kullanmaya devam etmek için bazı bağlantıları kaldırın.",
        ERR_CREATING_TICKET: "Veritabanında sohbet oluşturulurken hata oluştu.",
        ERR_FETCH_WAPP_MSG:
          "WhatsApp'ta mesaj alınırken hata oluştu, mesaj çok eski olabilir.",
        ERR_QUEUE_COLOR_ALREADY_EXISTS:
          "Bu renk zaten kullanılıyor, başka bir tane seçin.",
        ERR_QUEUE_INVALID_COLOR: "Bu renk geçersiz.",
        ERR_WAPP_GREETING_REQUIRED:
          "Birden fazla kuyruk varsa karşılama mesajı gereklidir.",
        ERR_MAX_USERS_REACHED:
          "Maksimum eşzamanlı kullanıcı sayısına ulaşıldı.",
        ERR_TICKET_NO_WHATSAPP:
          "Bir bağlantı atamak için konuşma listesini kontrol edin.",
        ERR_CANT_IMPORT_MSGS:
          "İçe aktarmaya yalnızca kişinin ilk konuşmasında izin verilir",
        ERR_NOT_WHATSAPPS_ONLINE:
          "Kişileri eklemek veya güncellemek için çevrimiçi bağlantı gereklidir. Bağlantılar sayfasını kontrol edin",
        ERR_CANNOT_EDIT_GROUPS: "Grup kişilerini düzenlemeye izin verilmiyor",
        ERR_ACCOUNT_DISABLED:
          "Hesabınız devre dışı bırakıldı, daha fazla bilgi için bizimle iletişime geçin ",
        ERR_TAG_INVALID_NAME:
          "Etiket adı en az iki karakter uzunluğunda olmalıdır",
        ERR_FASTRESP_SHORTCUT_ALREADY_EXISTS:
          "Bu kısayolla hızlı bir yanıt zaten var",
        ERR_TAG_ALREADY_EXISTS: "Bu ada sahip bir etiket zaten var",
        ERR_SUBSCRIPTION_EXPIRED:
          "Aboneliğinizin süresi doldu. Abonelik sayfasını kontrol edin",
        ERR_PLAN_CHANGED_RECENTLY:
          "30 gün içinde birden fazla değişikliğe izin verilmez.",
        ERR_CEP_NOT_FOUND: "Posta kodu bulunamadı. Adresi manuel olarak girin",
        ERR_NUMBER_IS_NOT_VERIFIED:
          "Kişi doğrulanmadı, numarayı kontrol edin ve tekrar deneyin.",
        ERR_DUPLICATED_CONTACT_NINTH:
          "Bu numaraya ait bir kişi zaten bulunuyor.",
        ERR_LAST_ADMIN: "Hesapta en az bir tane yöneticiniz olmalıdır.",
        ERR_CREATING_COMPANY: "Hasabyňyzy döredip bolmaýar Goldaw goldawy.",
        ERR_INVALID_RECAPTCHA:
          "Howpsuzlygy barlamak säwligi, müşderi goldawyna ýüz tutuň."
      },
      momentsUser: {
        services: "Hizmetler:",
        pending: "Beklemede",
        noqueue: "KUYRUK YOK",
        accessTicket: "Bilete Eriş",
      },
      schedules: {
        title: "Zamanlamalar",
        date: "Tarih",
        time: "Saat",
        event: "Etkinlik",
        allDay: "Tüm Gün",
        week: "Hafta",
        work_week: "İş Haftası",
        day: "Gün",
        month: "Ay",
        previous: "Önceki",
        next: "Sonraki",
        yesterday: "Dün",
        tomorrow: "Yarın",
        today: "Bugün",
        agenda: "Gündem",
        noEventsInRange: "Bu dönemde zamanlama yok.",
        errors: {
          noPermission: "Bu şirketin bu sayfaya erişim izni yok! Sizi yönlendiriyoruz.",
        },
        confirmationModal: {
          deleteTitle: "Bu Zamanlamayı silmek istediğinizden emin misiniz?",
          deleteMessage: "Bu işlem geri alınamaz.",
        },
        table: {
          contact: "Kişi",
          body: "Mesaj",
          sendAt: "Zamanlama Tarihi",
          sentAt: "Gönderilme Tarihi",
          status: "Durum",
          actions: "İşlemler",
        },
        buttons: {
          add: "Yeni Zamanlama",
        },
        toasts: {
          deleted: "Zamanlama başarıyla silindi.",
        },
      },
      scheduleModal: {
        title: {
          add: "Yeni Zamanlama",
          edit: "Zamanlamayı Düzenle",
          message: "Mesaj",
          sendError: "Gönderim Hatası",
        },
        validation: {
          messageTooShort: "Mesaj çok kısa",
          required: "Zorunlu",
        },
        form: {
          body: "Mesaj",
          contact: "Kişi",
          sendAt: "Zamanlama Tarihi",
          sentAt: "Gönderilme Tarihi",
          assinar: "İmza Gönder",
        },
        buttons: {
          okAdd: "Ekle",
          okEdit: "Kaydet",
          cancel: "İptal",
          addSchedule: "Zamanlama ekle",
        },
        success: "Zamanlama başarıyla kaydedildi.",
        toasts: {
          deleted: "Medya başarıyla silindi.",
        },
        confirmationModal: {
          deleteTitle: "Medyayı sil",
          deleteMessage: "Bu medyayı silmek istediğinizden emin misiniz?",
        },
      },
      campaigns: {
        title: "Kampanyalar",
        searchPlaceholder: "Ara",
        dialog: {
          form: {
            whatsapp: "Bağlantı",
            openTicket: "Bilet Aç",
            enabledOpenTicket: "Etkin",
            disabledOpenTicket: "Devre Dışı",
            statusTicket: "Bilet Durumu",
            closedTicketStatus: "Kapalı",
            openTicketStatus: "Açık",
          },
        },
        subMenus: {
          list: "Liste",
          listContacts: "Kişi Listesi",
          settings: "Ayarlar",
        },
      },
      campaignsConfig: {
        title: "Kampanya Ayarları",
        intervals: "Aralıklar",
        randomInterval: "Rastgele Gönderim Aralığı",
        noBreak: "Aralıksız",
        intervalGapAfter: "Daha büyük aralık sonra",
        undefined: "Tanımsız",
        messages: "mesajlar",
        laggerTriggerRange: "Daha büyük gönderim aralığı",
        save: "Kaydet",
        seconds: "saniye",
        forbiddenMessage: "Bu şirketin bu sayfaya erişim izni yok! Sizi yönlendiriyoruz.",
        confirmDelete: "Bu değişkeni silmek istediğinizden emin misiniz?",
        deleteMessage: "Bu işlem geri alınamaz.",
      },
      recurrenceSection: {
        title: "Tekrarlama",
        description:
          "Mesajı tekrarlı olarak göndermeyi seçebilir ve aralığı belirleyebilirsiniz. Tek seferlik bir mesaj ise, bu bölümde hiçbir şey değiştirmeyin.",
        labelInterval: "Aralık",
        intervalFilterValue: "Aralık filtre değeri",
        sendAsManyTimes: "Kaç kez gönder",
        options: {
          days: "Günler",
          weeks: "Haftalar",
          months: "Aylar",
          minutes: "Dakikalar",
        },
        shipNormallyOnNonbusinessDays: "İş günü olmayan günlerde normal gönder",
        sendOneBusinessDayBefore: "Bir iş günü önce gönder",
        sendOneBusinessDayLater: "Bir iş günü sonra gönder",
      },
      transferTicketModal: {
        title: "Bileti Transfer Et",
        fieldLabel: "Kullanıcı ara",
        fieldQueueLabel: "Kuyruğa transfer et",
        fieldQueuePlaceholder: "Kuyruk seç",
        noOptions: "Kullanıcı bulunamadı",
      },
      newTicketModal: {
        title: "Bilet Oluştur",
        fieldLabel: "Kişi ara",
        add: "Ekle",
      },
      tags: {
        title: "Etiketler",
        addColumns: "+ SÜTUN EKLE",
        search: "ARA",
        seeTicket: "BİLETİ GÖRÜNTÜLE",
        confirmationModal: {
          deleteTitle: "Bu Etiketi silmek istediğinizden emin misiniz?",
          deleteMessage: "Bu işlem geri alınamaz.",
        },
        table: {
          id: "ID",
          name: "İsim",
          kanban: "Kanban",
          color: "Renk",
          tickets: "Etiket Kayıtları",
          contacts: "Kişiler",
          actions: "İşlemler",
        },
        buttons: {
          add: "Yeni Etiket",
        },
        toasts: {
          deleted: "Etiket başarıyla silindi.",
        },
        contactModal: {
          title: "Kişiler",
          tableHeaders: {
            id: "ID",
            name: "İsim",
            number: "Numara",
            actions: "İşlemler",
          },
        },
      },
      tagModal: {
        title: {
          add: "Yeni Etiket",
          edit: "Etiketi Düzenle",
          addKanban: "Yeni Şerit",
          editKanban: "Şeridi Düzenle",
        },
        form: {
          name: "İsim",
          color: "Renk",
          timeLane: "Şeride yönlendirmek için dakika cinsinden süre",
          nextLaneId: "Şerit",
          greetingMessageLane: "Şerit karşılama mesajı",
          rollbackLaneId: "Hizmeti devam ettirdikten sonra şeride geri dön",
        },
        buttons: {
          okAdd: "Ekle",
          okEdit: "Kaydet",
          cancel: "İptal",
        },
        success: "Etiket başarıyla kaydedildi.",
        successKanban: "Şerit başarıyla kaydedildi.",
        validation: {
          messageTooShort: "Mesaj çok kısa",
          required: "Zorunlu",
        },
      },
      flowBuilder: {
        title: "Konuşma Akışları",
        titleWithCount: "Konuşma Akışları ({count})",
        searchPlaceholder: "Akışları ara...",
        newFlow: "Yeni Akış",
        createFirstFlow: "İlk Akışı Oluştur",
        noFlowsFound: "Akış bulunamadı",
        noFlowsCreated: "Henüz akış oluşturulmadı",
        tryOtherSearchTerms: "Başka arama terimleri kullanmayı deneyin",
        createFirstFlowDescription: "Müşteri hizmetlerini otomatikleştirmek için ilk konuşma akışınızı oluşturun",
        flowStatus: {
          active: "Aktif",
          inactive: "Pasif"
        },
        flowActions: {
          edit: "Düzenle",
          duplicate: "Çoğalt",
          delete: "Sil",
          editFlow: "Akışı düzenle",
          deleteFlow: "Akışı sil"
        },
        confirmations: {
          deleteTitle: "Akışı sil",
          deleteMessage: "Bu işlem geri alınamaz. İlgili tüm entegrasyonlar kaybolacak.",
          duplicateTitle: "Akışı çoğalt",
          duplicateMessage: "Düzenleyebilmeniz için akışın bir kopyası oluşturulacak."
        },
        toasts: {
          flowDeleted: "Akış başarıyla silindi",
          flowDuplicated: "Akış başarıyla çoğaltıldı",
          flowCreated: "Akış başarıyla oluşturuldu",
          flowUpdated: "Akış başarıyla güncellendi",
          errorDeleting: "Akış silinirken hata oluştu",
          errorDuplicating: "Akış çoğaltılırken hata oluştu"
        },
        modal: {
          title: "Konuşma Akışı",
          newFlow: "Yeni Akış",
          editFlow: "Akışı Düzenle",
          flowName: "Akış Adı",
          flowNamePlaceholder: "Akış adını girin",
          save: "Kaydet",
          cancel: "İptal"
        }
      },
      flowBuilderConfig: {
        title: "Akış Editörü",
        addNodes: "Düğüm Ekle",
        startNode: {
          title: "Akış başlangıcı",
          description: "Bu blok akışınızın başlangıcını belirtir!"
        },
        categories: {
          basics: "Temel",
          content: "İçerik",
          interaction: "Etkileşim",
          logic: "Mantık",
          system: "Sistem",
          integrations: "Entegrasyonlar"
        },
        nodes: {
          start: {
            name: "Başlangıç",
            description: "Akış başlangıç noktası"
          },
          content: {
            name: "İçerik",
            description: "Metin, görsel, ses veya video gönder"
          },
          text: {
            name: "Metin",
            description: "Basit metin mesajı"
          },
          menu: {
            name: "Menü",
            description: "Kullanıcı için seçenek menüsü"
          },
          input: {
            name: "Giriş",
            description: "Kullanıcı girişi topla"
          },
          interval: {
            name: "Aralık",
            description: "Yürütmeyi süre için duraklat"
          },
          randomizer: {
            name: "Rastgeleleştirici",
            description: "Rastgele yol seçimi"
          },
          queues: {
            name: "Kuyruklar",
            description: "Hizmet kuyruğunu yönet"
          },
          tags: {
            name: "Etiketler",
            description: "Kişiye etiket ekle"
          },
          removeTag: {
            name: "Etiketi Kaldır",
            description: "Kişiden etiket kaldır"
          },
          switchFlow: {
            name: "Akış Değiştir",
            description: "Başka bir akışa geç"
          },
          attendant: {
            name: "Görevli",
            description: "Görevliye aktar"
          },
          closeTicket: {
            name: "Bileti Kapat",
            description: "Hizmeti sonlandır"
          },
          webhook: {
            name: "WebHook",
            description: "HTTP entegrasyonu"
          },
          webform: {
            name: "Web Formu",
            description: "Web formu oluştur"
          },
          variable: {
            name: "Değişken",
            description: "Global değişkenleri tanımla"
          },
          assign: {
            name: "Atama",
            description: "Sohbeti görevliye ata"
          },
          openAI: {
            name: "OpenAI",
            description: "OpenAI entegrasyonu"
          },
          gemini: {
            name: "Gemini",
            description: "Google Gemini entegrasyonu"
          }
        },
        saveButton: "Akışı Kaydet",
        zoomIn: "Yakınlaştır",
        zoomOut: "Uzaklaştır",
        flowSaved: "Akış başarıyla kaydedildi!",
        errorSaving: "Akışı kaydetme hatası",
        seconds: "sn"
      },
      financial: {
        title: "Faturalar",
        invoices: "Faturalar",
        details: "Detaylar",
        users: "Kullanıcılar",
        connections: "Bağlantılar",
        queues: "Kuyruklar",
        value: "Değer",
        expirationDate: "Vade Tarihi",
        status: "Durum",
        action: "Eylem",
        pay: "ÖDE",
        paid: "ÖDENDİ",
        expired: "Süresi Dolmuş",
        open: "Açık",
        attentionMessage: "Dikkat:",
        expiredWarning: "Aboneliğinizin süresi dolmuş. Durumunuzu düzenlemek için lütfen destek ile iletişime geçin.",
        yes: "Evet",
        no: "Hayır",
      },
      salesReport: {
        title: "Satış Raporu",
        filters: {
          startDate: "Başlangıç Tarihi",
          endDate: "Bitiş Tarihi",
          user: "Kullanıcı",
          allUsers: "Tüm kullanıcılar",
          search: "Ara"
        },
        table: {
          attendant: "Görevli",
          date: "Tarih",
          saleValue: "Satış Değeri",
          noSaleReason: "Satış Yapılmama Nedeni",
          finalizationReason: "Sonlandırma Nedeni",
          totalSales: "Toplam Satış",
          totalSalesValue: "Toplam Satış Değeri",
          totalTickets: "Toplam Bilet",
          details: "Detaylar",
          users: "Kullanıcılar",
          connections: "Bağlantılar",
          queues: "Kuyruklar"
        }
      },
      placeholders: {
        chooseFlow: "Bir akış seçin",
        filterByTags: "Etiketlere göre filtrele",
        departments: "Departmanlar",
        searchTemplates: "Şablon Ara",
        emailAddress: "E-posta adresi",
        contacts: "Kişiler",
        tags: "Etiketler",
        users: "Kullanıcılar",
        azureSpeechKey: "Azure Konuşma Hizmeti Anahtarı",
        search: "Ara",
        selectOption: "Bir seçenek seçin",
        typeHere: "Buraya yazın",
        enterValue: "Değer girin",
        selectDate: "Tarih seçin",
        chooseFile: "Dosya seçin"
      },
      validation: {
        required: "Gerekli",
        invalidEmail: "Geçersiz email",
        tooShort: "Çok kısa",
        tooLong: "Çok uzun",
        minLength: "En az {{min}} karakter",
        maxLength: "En fazla {{max}} karakter",
        requiredField: "Zorunlu alan",
        apiKeyRequired: "API Key gereklidir",
        voiceModeRequired: "Ses modu gereklidir",
        voiceKeyRequired: "Ses sentezi için Voice Key gereklidir",
        voiceRegionRequired: "Ses sentezi için Voice Region gereklidir",
        keywordEmpty: "Anahtar kelime boş olamaz",
        goalRequired: "Otomatik tamamlama aktifken hedef gereklidir",
        ratingRequired: "Değerlendirme zorunludur"
      },
      toasts: {
        common: {
          error: "İstek işlenirken hata oluştu",
          success: "İşlem başarıyla tamamlandı",
          loading: "Yükleniyor...",
          warning: "Uyarı",
          info: "Bilgi"
        },
        finalizacaoVenda: {
          informValue: "Lütfen satış tutarını girin",
          ticketFinalized: "Bilet başarıyla sonlandırıldı!",
          errorFinishing: "Bilet sonlandırılırken hata"
        },
        flowBuilder: {
          tagRemoved: "Etiket başarıyla kaldırıldı!",
          selectTag: "Kaldırılacak etiketi seçin",
          nodeAdded: "Düğüm akışa eklendi",
          nodeRemoved: "Düğüm akıştan kaldırıldı",
          flowSaved: "Akış başarıyla kaydedildi",
          errorSaving: "Akış kaydedilirken hata"
        },
        tickets: {
          finalized: "Bilet başarıyla sonlandırıldı!",
          errorFinalizing: "Bilet sonlandırılırken hata",
          transferred: "Bilet başarıyla transfer edildi",
          errorTransferring: "Bilet transfer edilirken hata",
          accepted: "Bilet başarıyla kabul edildi",
          errorAccepting: "Bilet kabul edilirken hata"
        },
        settings: {
          noPermission: "Erişim izni yok!",
          saved: "Ayarlar başarıyla kaydedildi",
          errorSaving: "Ayarlar kaydedilirken hata",
          fileRequired: "Lütfen bir dosya seçin!",
          destinationRequired: "Lütfen bir hedef seçin!",
          fileSent: "Dosya başarıyla gönderildi!",
          errorSending: "Dosya gönderilirken hata",
          invalidFormat: "Sadece p12 formatında dosyalar!"
        },
        connections: {
          created: "Bağlantı başarıyla oluşturuldu",
          updated: "Bağlantı başarıyla güncellendi",
          deleted: "Bağlantı başarıyla silindi",
          errorCreating: "Bağlantı oluşturulurken hata",
          errorUpdating: "Bağlantı güncellenirken hata",
          errorDeleting: "Bağlantı silinirken hata"
        },
        campaigns: {
          created: "Kampanya başarıyla oluşturuldu",
          updated: "Kampanya başarıyla güncellendi",
          deleted: "Kampanya başarıyla silindi",
          started: "Kampanya başarıyla başlatıldı",
          paused: "Kampanya başarıyla duraklatıldı",
          errorCreating: "Kampanya oluşturulurken hata",
          errorUpdating: "Kampanya güncellenirken hata",
          errorDeleting: "Kampanya silinirken hata"
        },
        contacts: {
          imported: "Kişiler başarıyla içe aktarıldı",
          exported: "Kişiler başarıyla dışa aktarıldı",
          deleted: "Kişi başarıyla silindi",
          errorImporting: "Kişiler içe aktarılırken hata",
          errorExporting: "Kişiler dışa aktarılırken hata",
          errorDeleting: "Kişi silinirken hata"
        },
        dashboard: {
          createdTickets: "Oluşturulan Biletler"
        }
      },
      dialogs: {
        announcements: "Duyurular",
        chooseColor: "Bir renk seçin",
        finalizationValue: "Hizmet Sonlandırma - Satış Değeri",
        editNote: "Notu Düzenle",
        editMessage: "Mesajı Düzenle",
        forwardMessage: "Mesajı İlet",
        chooseOption: "Bir seçenek seçin",
        editBodyRequest: "İstek gövdesini düzenle",
        fullApiResponse: "Tam API yanıtı",
        loadingSettings: "Ayarlar yükleniyor...",
        templateDetails: "Seçilen Şablon Detayları",
        selectedTemplate: {
          name: "Ad",
          content: "İçerik",
          language: "Dil",
          category: "Kategori"
        }
      },
      forms: {
        labels: {
          openaiModel: "OpenAI Modeli",
          geminiModel: "Gemini Modeli",
          responseType: "Yanıt Türü",
          operationMode: "Çalışma Modu",
          selectChat: "Sohbet seçin",
          selectCurrency: "Para Birimi Seçin",
          attendant: "Görevli",
          noSaleReason: "Satış Yapılmama Nedeni",
          finalizationReason: "Sonlandırma Nedeni",
          chooseAttendant: "Bir görevli seçin",
          whatsappConnections: "WhatsApp Bağlantıları",
          type: "Tür",
          campaigns: "Kampanyalar",
          sendAsRecordedAudio: "Kaydedilmiş ses olarak gönder",
          noSales: "Satış Yok",
          welcomeFlow: "Hoş geldin akışı",
          defaultResponseFlow: "Varsayılan yanıt akışı"
        }
      }
    }
  }
};

export { messages };
