
// etkinlik ilanı için.

export class Activity {
    constructor(userId,head, companyName, location, startDate,description, organizerFullName, contactInfo, photo) {
        this.userId = userId;
        this.head = head; // Etkinlik başlığı
        this.companyName = companyName; // Etkinliği düzenleyen şirketin adı
        this.location = location; // Etkinlik yeri 
        this.startDate = startDate; // Etkinlik başlama tarihi ve saati
        this.description = description; // Etkinlik açıklaması 
        this.imageUrl = imageUrl; // Etkinlik resmi (isteğe bağlı)
        this.organizerFullName = organizerFullName; // Etkinliği düzenleyen kişinin tam adı
        this.contactInfo = contactInfo; // Etkinlik iletişim adresi (telefon, e-posta vb.)
        this.photo = photo;

    }
};
