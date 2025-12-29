// stories-list.js

// ========================================
// قائمة القصص الـ 50
// ========================================
const stories = [
    { id: 1, name: "آداب الطعام والشراب" },
    { id: 2, name: "النظافة الشخصية" },
    { id: 3, name: "آداب الحديث والاستئذان" },
    { id: 4, name: "بر الوالدين" },
    { id: 5, name: "برّ الجيران" },
    { id: 6, name: "الصدق والأمانة" },
    { id: 7, name: "التعاون والمشاركة" },
    { id: 8, name: "احترام المعلمين" },
    { id: 9, name: "الالتزام في المدرسة" },
    { id: 10, name: "النظام والترتيب" },
    { id: 11, name: "الصبر" },
    { id: 12, name: "الشكر" },
    { id: 13, name: "آداب استخدام الهاتف" },
    { id: 14, name: "آداب الطريق" },
    { id: 15, name: "ضبط النفس" },
    { id: 16, name: "التواضع" },
    { id: 17, name: "الاعتذار عند الخطأ" },
    { id: 18, name: "حب الوطن" },
    { id: 19, name: "احترام الآخر" },
    { id: 20, name: "احترام الوقت" },
    { id: 21, name: "العطاء والعمل الجماعي" },
    { id: 22, name: "تقبل النقد" },
    { id: 23, name: "الاهتمام بالبيئة" },
    { id: 24, name: "تجنب التنمر" },
    { id: 25, name: "الحفاظ على الخصوصية" },
    { id: 26, name: "التعاون مع الأسرة" },
    { id: 27, name: "التعبير عن المشاعر" },
    { id: 28, name: "مساعدة الزملاء" },
    { id: 29, name: "احترام القوانين" },
    { id: 30, name: "المبادرة بالأعمال الطيبة" },
    { id: 31, name: "الإيثار" },
    { id: 32, name: "الرفق بالحيوان" },
    { id: 33, name: "التفاؤل والأمل" },
    { id: 34, name: "القناعة" },
    { id: 35, name: "الشجاعة" },
    { id: 36, name: "حسن الاستماع" },
    { id: 37, name: "إفشاء السلام" },
    { id: 38, name: "زيارة المريض" },
    { id: 39, name: "الابتسامة" },
    { id: 40, name: "الهدية" },
    { id: 41, name: "شكر النعمة" },
    { id: 42, name: "حفظ اللسان" },
    { id: 43, name: "آداب الطعام" },
    { id: 44, name: "آداب النوم" },
    { id: 45, name: "آداب العطاس" },
    { id: 46, name: "آداب المجلس" },
    { id: 47, name: "حق الجار" },
    { id: 48, name: "صلة الرحم" },
    { id: 49, name: "الرفق بالحيوان" },
    { id: 50, name: "إماطة الأذى" }
];

// ========================================
// متغيرات عامة
// ========================================
let selectedStoryId = null;
let selectedAge = null;

// ========================================
// تهيئة الصفحة
// ========================================
document.addEventListener('DOMContentLoaded', function () {
    renderStories();
});

// ========================================
// عرض القصص
// ========================================
function renderStories() {
    const grid = document.getElementById('storiesGrid');
    grid.innerHTML = '';

    stories.forEach(story => {
        const card = createStoryCard(story);
        grid.appendChild(card);
    });
}

// ========================================
// إنشاء بطاقة قصة
// ========================================
function createStoryCard(story) {
    const card = document.createElement('div');
    card.className = 'story-card';
    card.onclick = () => openAgeModal(story.id, story.name);

    // صورة القصة (placeholder إذا لم تكن موجودة)
    const imagePath = `images/story-${story.id}.jpg`;
    const imageContainer = document.createElement('div');
    imageContainer.className = 'story-image-container';

    const img = document.createElement('img');
    img.className = 'story-image';
    img.src = imagePath;
    img.alt = story.name;
    img.onerror = function () {
        // إذا لم تكن الصورة موجودة، استخدم placeholder
        this.style.display = 'none';
        const placeholder = document.createElement('div');
        placeholder.className = 'story-image-placeholder';
        placeholder.innerHTML = '<i class="fas fa-book"></i>';
        imageContainer.appendChild(placeholder);
    };

    imageContainer.appendChild(img);

    // محتوى البطاقة
    const content = document.createElement('div');
    content.className = 'story-content';

    const name = document.createElement('h3');
    name.className = 'story-name';
    name.textContent = story.name;

    const ages = document.createElement('div');
    ages.className = 'story-ages';

    // الفئات العمرية الثلاثة
    const ageGroups = [
        { range: '3-5', icon: 'fa-baby', label: '3-5 سنوات' },
        { range: '6-8', icon: 'fa-child', label: '6-8 سنوات' },
        { range: '9-12', icon: 'fa-user-graduate', label: '9-12 سنوات' }
    ];

    ageGroups.forEach(ageGroup => {
        const badge = document.createElement('div');
        badge.className = `age-badge age-${ageGroup.range}`;
        badge.innerHTML = `
            <i class="fas ${ageGroup.icon}"></i>
            <span>${ageGroup.label}</span>
        `;
        badge.onclick = (e) => {
            e.stopPropagation();
            selectAgeForStory(story.id, ageGroup.range);
        };
        badge.style.cursor = 'pointer';
        ages.appendChild(badge);
    });

    content.appendChild(name);
    content.appendChild(ages);

    card.appendChild(imageContainer);
    card.appendChild(content);

    return card;
}

// ========================================
// فتح نافذة اختيار الفئة العمرية
// ========================================
function openAgeModal(storyId, storyName) {
    selectedStoryId = storyId;
    document.getElementById('modalStoryTitle').textContent = `${storyName} - اختر الفئة العمرية`;
    document.getElementById('ageModal').classList.add('active');
}

// ========================================
// إغلاق نافذة اختيار الفئة العمرية
// ========================================
function closeAgeModal() {
    document.getElementById('ageModal').classList.remove('active');
    selectedStoryId = null;
    selectedAge = null;
}

// ========================================
// اختيار الفئة العمرية من النافذة
// ========================================
function selectAge(age) {
    if (selectedStoryId) {
        selectAgeForStory(selectedStoryId, age);
    }
}

// ========================================
// اختيار الفئة العمرية والانتقال للقصة
// ========================================
function selectAgeForStory(storyId, age) {
    // إغلاق النافذة
    // الانتقال إلى صفحة القصة
    // سيتم توجيه المستخدم إلى story.html?story=1&age=3-5
    closeAgeModal();
    window.location.href = `story.html?story=${storyId}&age=${age}`;
}

// ========================================
// إغلاق النافذة عند النقر خارجها
// ========================================
window.onclick = function (event) {
    const modal = document.getElementById('ageModal');
    if (event.target === modal) {
        closeAgeModal();
    }
}
