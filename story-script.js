// story-script.js

// ========================================
// 📚 المتغيرات الرئيسية
// ========================================
let currentPage = 0;
const totalPages = 9; // من 0 إلى 8: (0) الغلاف، (1-7) القصة، (8) صفحة الانتقال للأسئلة
let audioEnabled = false;
let storyAudios = []; // مصفوفة لتخزين مراجع ملفات صوت كل صفحة (من 1 إلى 7)
let quizAudio = null;
let currentPlayingAudio = null; // لتتبع ملف الصوت الذي يتم تشغيله حاليًا (سواء قصة أو أسئلة)

// ========================================
// ⚙️ تهيئة الصوت وعناصر HTML
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    // عرض صفحة البداية
    document.getElementById('intro-page').classList.add('active');

    // تهيئة ملفات الصوت للقصة (الصفحات من 1 إلى 7)
    for (let i = 1; i <= 7; i++) { 
        const audio = document.getElementById(`audio-page-${i}`);
        if (audio) {
            storyAudios[i] = audio;
            // إضافة مستمع لحدث انتهاء الصوت للانتقال التلقائي
            storyAudios[i].addEventListener('ended', function() {
                if (audioEnabled) { 
                    nextPage();
                }
            });
        }
    }

    // تهيئة ملف صوت الأسئلة
    quizAudio = document.getElementById('quiz-audio');

    // تحديث عداد الصفحات والتنقل
    updatePageCounter();
    updateNavigationButtons();
});

// ========================================
// 🔊 وظائف التحكم بالصوت العام
// ========================================

/** إيقاف أي صوت يعمل حالياً وإعادته للبداية (سواء قصة أو أسئلة) */
function stopCurrentAudio() {
    if (currentPlayingAudio) {
        currentPlayingAudio.pause();
        currentPlayingAudio.currentTime = 0; 
        currentPlayingAudio = null;
    }
}

/** تشغيل الصوت الخاص بصفحة معينة */
function playPageAudio(pageNumber) {
    stopCurrentAudio(); // أوقف الصوت السابق قبل تشغيل الجديد
    
    if (!audioEnabled) {
        return; 
    }

    let audioToPlay = null;

    if (pageNumber >= 1 && pageNumber <= 7) {
        // صوت صفحات القصة
        audioToPlay = storyAudios[pageNumber];
    } else if (pageNumber === 8 && quizAudio) {
        // صوت صفحة الانتقال للأسئلة
        audioToPlay = quizAudio; 
    }
    
    if (audioToPlay) {
        currentPlayingAudio = audioToPlay;
        currentPlayingAudio.play().catch(e => console.error("Error playing audio:", e));
        
        // تحديث زر التحكم العائم ليعكس حالة التشغيل
        document.getElementById('audioControlBtn').classList.remove('muted');
        document.getElementById('audioIcon').classList.replace('fa-volume-mute', 'fa-volume-up');
    }
}

/** تبديل حالة تشغيل/إيقاف الصوت العام للقصة (لزر التحكم العائم) */
function toggleAudio() {
    const audioIcon = document.getElementById('audioIcon');
    const audioControlBtn = document.getElementById('audioControlBtn');

    // المنطق: إذا كان هناك صوت يعمل فعلاً (ليس فقط مفعلاً)
    if (currentPlayingAudio && !currentPlayingAudio.paused) {
        // إيقاف الصوت
        currentPlayingAudio.pause();
        audioControlBtn.classList.add('muted');
        audioIcon.classList.replace('fa-volume-up', 'fa-volume-mute');
    } else if (currentPlayingAudio && currentPlayingAudio.paused) {
        // تشغيل الصوت
        currentPlayingAudio.play();
        audioControlBtn.classList.remove('muted');
        audioIcon.classList.replace('fa-volume-mute', 'fa-volume-up');
    }
    // ملاحظة: زر التحكم العائم الآن يتحكم فقط في التشغيل/الإيقاف المؤقت للصوت الحالي.
}

/** تبديل حالة تشغيل/إيقاف صوت صفحة الأسئلة (لزرها الخاص) */
function toggleQuizAudio() {
    const quizAudioIcon = document.getElementById('quizAudioIcon');
    const quizAudioBtn = document.getElementById('quizAudioBtn');

    if (quizAudio && !quizAudio.paused) {
        quizAudio.pause();
        quizAudioBtn.classList.add('muted');
        quizAudioIcon.classList.replace('fa-volume-up', 'fa-volume-mute');
    } else if (quizAudio && quizAudio.paused) {
        quizAudio.play().catch(e => console.error("Error playing quiz audio:", e));
        quizAudioBtn.classList.remove('muted');
        quizAudioIcon.classList.replace('fa-volume-mute', 'fa-volume-up');
    }
}

/** إيقاف صوت الأسئلة (دالة مساعدة) */
function stopQuizAudio() {
    if (quizAudio && !quizAudio.paused) {
        quizAudio.pause();
        quizAudio.currentTime = 0;
    }
}

// ========================================
// ➡️ وظائف التنقل بين الصفحات
// ========================================

/** عرض صفحة معينة وتحديث منطق الصوت والأزرار */
function showPage(pageIndex) {
    const pages = document.querySelectorAll('.book .page');
    
    // إخفاء كل صفحات الكتاب أولاً
    pages.forEach(page => {
        page.classList.remove('active');
    });

    // عرض الصفحة المطلوبة
    const targetPage = document.getElementById(`page-${pageIndex}`);
    if (targetPage) {
        targetPage.classList.add('active');
        currentPage = pageIndex;
    }

    // 🔊 تشغيل الصوت بناءً على الصفحة الجديدة
    playPageAudio(pageIndex);
    
    // تحديث عناصر الواجهة
    updatePageCounter();
    updateNavigationButtons();
}

/** الانتقال إلى الصفحة التالية */
function nextPage() {
    // الانتقال من صفحة القصة الأخيرة (7) إلى صفحة الانتقال للأسئلة (8)
    if (currentPage < totalPages - 1) { 
        showPage(currentPage + 1);
    } else if (currentPage === totalPages - 1) { 
        // من صفحة الانتقال للأسئلة (8) إلى بدء الأسئلة
        startQuiz();
    }
}

/** الانتقال إلى الصفحة السابقة */
function prevPage() {
    if (currentPage > 0) {
        showPage(currentPage - 1);
    } else if (currentPage === 0) {
        showIntroPage();
    }
}

/** تحديث حالة أزرار التنقل (السابق/التالي) */
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    // لا يمكن العودة من الغلاف (صفحة 0)
    prevBtn.disabled = currentPage === 0; 
    
    // زر التالي يعمل حتى صفحة الانتقال للأسئلة (صفحة 8)
    nextBtn.disabled = false; // دائماً فعال حتى ننتقل إلى صفحة الأسئلة
}

/** تحديث عداد الصفحات */
function updatePageCounter() {
    // يعرض رقم الصفحة الحالية (بدءاً من 1) من إجمالي عدد الصفحات
    document.getElementById('currentPage').textContent = currentPage + 1;
    document.getElementById('totalPages').textContent = totalPages;
}

// ========================================
// 🎬 وظائف التحكم في سير القصة
// ========================================

/** وظيفة بدء القصة (يتم استدعاؤها بزر "ابدأ القصة") */
function startStory() {
    const introPage = document.getElementById('intro-page');
    const bookPage = document.getElementById('book-page');
    const audioCheckbox = document.getElementById('audio-checkbox');
    const audioControlBtn = document.getElementById('audioControlBtn');

    // 1. تحديد حالة الصوت من الـ Checkbox
    audioEnabled = audioCheckbox.checked;

    // 2. تغيير الواجهة
    introPage.classList.remove('active');
    bookPage.classList.add('active');

    // 3. عرض زر التحكم العائم وتحديد حالته الأولية
    audioControlBtn.classList.add('active');
    if (audioEnabled) {
        audioControlBtn.classList.remove('muted');
        document.getElementById('audioIcon').classList.replace('fa-volume-mute', 'fa-volume-up');
    } else {
        audioControlBtn.classList.add('muted');
        document.getElementById('audioIcon').classList.replace('fa-volume-up', 'fa-volume-mute');
    }

    // 4. البدء من صفحة الغلاف (0)
    currentPage = 0; 
    showPage(currentPage); // showPage ستقوم بتشغيل الصوت إذا كان مفعلاً و موجوداً
}

/** العودة إلى صفحة البداية */
function showIntroPage() {
    document.getElementById('book-page').classList.remove('active');
    document.getElementById('quiz-page').classList.remove('active');
    document.getElementById('intro-page').classList.add('active');
    
    stopCurrentAudio(); // إيقاف أي صوت يعمل
    document.getElementById('audioControlBtn').classList.remove('active'); // إخفاء زر الصوت العائم
    document.getElementById('quizAudioBtn').classList.remove('active'); // إخفاء زر صوت الأسئلة
}

// ========================================
// ❓ وظائف صفحة الأسئلة
// ========================================

/** بدء الاختبار */
function startQuiz() {
    document.getElementById('book-page').classList.remove('active');
    document.getElementById('quiz-page').classList.add('active');
    
    stopCurrentAudio(); // إيقاف صوت القصة
    document.getElementById('audioControlBtn').classList.remove('active'); // إخفاء زر صوت القصة
    
    const quizAudioBtn = document.getElementById('quizAudioBtn');
    quizAudioBtn.classList.add('active'); // إظهار زر صوت الأسئلة

    // تشغيل صوت الأسئلة
    if (audioEnabled) { 
        playPageAudio(8); // استدعاء playPageAudio للصفحة 8 (صوت الأسئلة)
        quizAudioBtn.classList.remove('muted');
        document.getElementById('quizAudioIcon').classList.replace('fa-volume-mute', 'fa-volume-up');
    } else {
        quizAudioBtn.classList.add('muted');
        document.getElementById('quizAudioIcon').classList.replace('fa-volume-up', 'fa-volume-mute');
    }
    
    // إخفاء النتائج وإعادة تعيين الخيارات
    document.getElementById('result').classList.remove('show', 'success', 'partial', 'fail');
    document.getElementById('restartBtn').style.display = 'none';
    document.querySelectorAll('#quiz-page input[type="radio"]').forEach(radio => radio.checked = false);
    
    // إعادة تعيين ألوان الأسئلة
    document.querySelectorAll('.question').forEach(q => {
        q.style.background = 'rgba(123, 67, 151, 0.05)';
        q.style.borderColor = '#7b4397';
    });
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}


/** تقديم الاختبار وحساب النتيجة */
function submitQuiz() {
    const questionsCount = 10; 
    let correctAnswers = 0;
    
    // مصفوفات لأسماء حقول الأسئلة
    const mcqQuestions = ['q1', 'q2', 'q3', 'q4', 'q5'];
    const tfQuestions = ['tf1', 'tf2', 'tf3', 'tf4', 'tf5'];
    
    // التحقق من الإجابات وتلوينها
    [...mcqQuestions, ...tfQuestions].forEach(questionName => {
        const selectedOption = document.querySelector(`input[name="${questionName}"]:checked`);
        const questionElement = document.querySelector(`input[name="${questionName}"]`).closest('.question');
        
        // إعادة تعيين الألوان
        questionElement.style.background = 'rgba(123, 67, 151, 0.05)';
        questionElement.style.borderColor = '#7b4397';

        if (selectedOption) {
            if (selectedOption.value === 'correct') {
                correctAnswers++;
                questionElement.style.background = 'rgba(76, 175, 80, 0.2)'; // أخضر فاتح
                questionElement.style.borderColor = '#4CAF50';
            } else {
                questionElement.style.background = 'rgba(244, 67, 54, 0.2)'; // أحمر فاتح
                questionElement.style.borderColor = '#f44336';
            }
        }
    });

    // عرض النتيجة
    const resultDiv = document.getElementById('result');
    const restartBtn = document.getElementById('restartBtn');
    const percentage = (correctAnswers / questionsCount) * 100;
    
    let message = '';
    let resultClass = '';
    
    if (percentage === 100) {
        message = `🎉 ممتاز! لقد أجبت على جميع الأسئلة بشكل صحيح! 
        <br>درجتك: ${correctAnswers}/${questionsCount} (${percentage}%)
        <br>أنت بطل! فهمت القصة جيداً 🌟`;
        resultClass = 'success';
    } else if (percentage >= 70) {
        message = `👏 أحسنت! لقد أجبت بشكل جيد! 
        <br>درجتك: ${correctAnswers}/${questionsCount} (${percentage.toFixed(0)}%)
        <br>راجع الإجابات الخاطئة وحاول مرة أخرى 📚`;
        resultClass = 'partial';
    } else {
        message = `💪 حاول مرة أخرى! 
        <br>درجتك: ${correctAnswers}/${questionsCount} (${percentage.toFixed(0)}%)
        <br>اقرأ القصة مرة أخرى بتركيز أكبر 📖`;
        resultClass = 'fail';
    }
    
    resultDiv.innerHTML = message;
    resultDiv.className = `result ${resultClass} show`;
    restartBtn.style.display = 'block';
    
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/** وظيفة إعادة بدء القصة (من صفحة الأسئلة) */
function restartStory() {
    // إيقاف أي صوت يعمل
    stopCurrentAudio();
    stopQuizAudio(); // للتأكد أيضاً
    
    // إعادة تعيين كل شيء لحالة البداية
    currentPage = 0;
    audioEnabled = false;
    
    // إعادة تعيين حالة زر الصوت في صفحة البداية
    document.getElementById('audio-checkbox').checked = false;
    
    // العودة إلى صفحة البداية
    showIntroPage(); 
    
    // إخفاء النتيجة وزر الإعادة
    document.getElementById('result').classList.remove('show');
    document.getElementById('restartBtn').style.display = 'none';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========================================
// ⌨️ التحكم بلوحة المفاتيح
// ========================================
document.addEventListener('keydown', function(event) {
    // في صفحة الكتاب فقط
    if (document.getElementById('book-page').classList.contains('active')) {
        // السهم الأيمن للصفحة السابقة (في RTL)
        if (event.key === 'ArrowRight') {
            prevPage();
        }
        // السهم الأيسر للصفحة التالية (في RTL)
        else if (event.key === 'ArrowLeft') {
            nextPage();
        }
    } 
});

// ========================================
// 💡 ملاحظة: يجب أن تحتوي ملفات الـ HTML على الـ IDs التالية:
// - audio-page-1 إلى audio-page-7
// - quiz-audio
// - audio-checkbox
// - prevBtn, nextBtn
// - currentPage, totalPages
// - audioControlBtn, audioIcon
// - quizAudioBtn, quizAudioIcon
// ========================================