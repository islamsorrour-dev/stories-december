// story-script-dynamic.js
// ملف JavaScript الديناميكي للقصة

// ========================================
// 📚 المتغيرات الرئيسية
// ========================================
let currentPage = 0;
let totalPages = 0;
let audioEnabled = false;
let storyAudios = [];
let quizAudio = null;
let currentPlayingAudio = null;
let currentStoryData = null;
let currentStoryId = null;
let currentAge = null;

// ========================================
// ⚙️ تهيئة الصفحة
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    // الحصول على معاملات URL
    const urlParams = new URLSearchParams(window.location.search);
    currentStoryId = parseInt(urlParams.get('story')) || 1;
    currentAge = urlParams.get('age') || '3-5';

    // تحميل بيانات القصة
    if (storiesData[currentStoryId] && storiesData[currentStoryId][currentAge]) {
        currentStoryData = storiesData[currentStoryId][currentAge];
        initializeStory();
    } else {
        alert('القصة غير موجودة!');
        goBackToList();
    }
});

// ========================================
// تهيئة القصة
// ========================================
function initializeStory() {
    // تحديث معلومات القصة في صفحة البداية
    document.getElementById('storyTitle').textContent = currentStoryData.title;
    document.getElementById('storyDescription').textContent = `قصة تعليمية عن ${storiesData[currentStoryId].name}`;
    document.getElementById('storyPages').textContent = currentStoryData.pages.length + 2; // +2 للغلاف وصفحة النهاية
    document.getElementById('storyAge').textContent = currentAge;
    
    // تحديث الأيقونة حسب نوع القصة
    const icons = {
        1: 'fa-utensils',
        2: 'fa-soap',
        3: 'fa-heart',
        // يمكن إضافة المزيد
    };
    const iconClass = icons[currentStoryId] || 'fa-book';
    document.getElementById('storyIcon').className = `fas ${iconClass}`;

    // إنشاء صفحات القصة
    createStoryPages();
    
    // إنشاء ملفات الصوت
    createAudioFiles();
    
    // إنشاء صفحة الأسئلة
    createQuizPage();
    
    // تحديث العداد
    totalPages = currentStoryData.pages.length + 2; // +2 للغلاف وصفحة النهاية
    updatePageCounter();
    updateNavigationButtons();
}

// ========================================
// إنشاء صفحات القصة
// ========================================
function createStoryPages() {
    const bookContent = document.getElementById('bookContent');
    bookContent.innerHTML = '';

    // صفحة الغلاف
    const coverPage = document.createElement('div');
    coverPage.className = 'page';
    coverPage.id = 'page-0';
    coverPage.innerHTML = `
        <div class="page-content cover-page">
            <div class="cover-image-container">
                <img src="${currentStoryData.pages[0]?.image || 'images/1.png'}" alt="غلاف القصة" class="cover-main-image" onerror="this.src='images/1.png'">
            </div>
            <h1>${currentStoryData.title}</h1>
            <p class="cover-subtitle">${currentStoryData.subtitle}</p>
        </div>
    `;
    bookContent.appendChild(coverPage);

    // صفحات القصة
    currentStoryData.pages.forEach((page, index) => {
        const pageDiv = document.createElement('div');
        pageDiv.className = 'page';
        pageDiv.id = `page-${index + 1}`;
        
        const textLines = page.text.split('\n').map(line => `<p>${line}</p>`).join('');
        
        pageDiv.innerHTML = `
            <div class="page-content">
                <div class="image-box">
                    <img src="${page.image}" alt="صورة القصة" onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'display:flex;align-items:center;justify-content:center;height:100%;color:#999;\\'><i class=\\'fas fa-image\\' style=\\'font-size:3rem;\\'></i></div>'">
                </div>
                <div class="text-box">
                    ${textLines}
                </div>
            </div>
        `;
        bookContent.appendChild(pageDiv);
    });

    // صفحة المعنى
    const moralPage = document.createElement('div');
    moralPage.className = 'page';
    moralPage.id = `page-${currentStoryData.pages.length + 1}`;
    const objectivesList = currentStoryData.objectives.map(obj => `<li>${obj}</li>`).join('');
    moralPage.innerHTML = `
        <div class="page-content end-page">
            <div class="moral-box">
                <div class="moral-icon">
                    <i class="fas fa-heart"></i>
                </div>
                <h2>المعنى من القصة</h2>
                <p>${currentStoryData.moral}</p>
                <div class="objectives">
                    <h3>أهداف القصة:</h3>
                    <ul>
                        ${objectivesList}
                    </ul>
                </div>
            </div>
        </div>
    `;
    bookContent.appendChild(moralPage);

    // صفحة الانتقال للأسئلة
    const finalPage = document.createElement('div');
    finalPage.className = 'page';
    finalPage.id = `page-${currentStoryData.pages.length + 2}`;
    finalPage.innerHTML = `
        <div class="page-content final-page">
            <div class="final-icon">
                <i class="fas fa-star"></i>
            </div>
            <h2>هل استمتعت بالقصة؟</h2>
            <p>الآن حان وقت اختبار معلوماتك!</p>
            <button class="btn-quiz" onclick="startQuiz()">
                <i class="fas fa-question-circle"></i>
                ابدأ الأسئلة
            </button>
        </div>
    `;
    bookContent.appendChild(finalPage);

    // عرض صفحة الغلاف
    showPage(0);
}

// ========================================
// إنشاء ملفات الصوت
// ========================================
function createAudioFiles() {
    const audioContainer = document.getElementById('audioContainer');
    audioContainer.innerHTML = '';

    // إنشاء ملفات صوت للصفحات
    currentStoryData.pages.forEach((page, index) => {
        const audio = document.createElement('audio');
        audio.id = `audio-page-${index + 1}`;
        audio.src = `audio/story-${currentStoryId}-${currentAge}-${index + 1}.mp3`;
        audio.addEventListener('error', function() {
            // إذا لم يكن الملف موجوداً، لا شيء
        });
        audioContainer.appendChild(audio);
        storyAudios[index + 1] = audio;
        
        // إضافة مستمع لحدث انتهاء الصوت
        audio.addEventListener('ended', function() {
            if (audioEnabled) {
                nextPage();
            }
        });
    });

    // ملف صوت صفحة المعنى
    const moralAudio = document.createElement('audio');
    moralAudio.id = `audio-page-${currentStoryData.pages.length + 1}`;
    moralAudio.src = `audio/story-${currentStoryId}-${currentAge}-moral.mp3`;
    audioContainer.appendChild(moralAudio);
    storyAudios[currentStoryData.pages.length + 1] = moralAudio;

    // ملف صوت الأسئلة
    quizAudio = document.createElement('audio');
    quizAudio.id = 'quiz-audio';
    quizAudio.src = `audio/story-${currentStoryId}-${currentAge}-quiz.mp3`;
    audioContainer.appendChild(quizAudio);
}

// ========================================
// إنشاء صفحة الأسئلة
// ========================================
function createQuizPage() {
    const quizContainer = document.getElementById('quizContainer');
    const quiz = currentStoryData.quiz;
    
    let html = '<h1 class="quiz-title">اختبر معلوماتك</h1>';

    // أسئلة الاختيار من متعدد
    if (quiz.mcq && quiz.mcq.length > 0) {
        html += '<div class="quiz-section"><h2 class="section-title">أولاً: اختار الإجابة الصحيحة</h2>';
        quiz.mcq.forEach((q, index) => {
            html += `
                <div class="question">
                    <p class="question-text">${index + 1}. ${q.q}</p>
                    <div class="options">
            `;
            q.options.forEach((option, optIndex) => {
                const isCorrect = optIndex === q.correct ? 'correct' : 'wrong';
                html += `<label><input type="radio" name="mcq${index}" value="${isCorrect}"> ${option}</label>`;
            });
            html += '</div></div>';
        });
        html += '</div>';
    }

    // أسئلة صح أم خطأ
    if (quiz.tf && quiz.tf.length > 0) {
        html += '<div class="quiz-section"><h2 class="section-title">ثانياً: ضع علامة (✓) أو (✗)</h2>';
        quiz.tf.forEach((q, index) => {
            html += `
                <div class="question">
                    <p class="question-text">${index + 1}. ${q.q}</p>
                    <div class="options">
                        <label><input type="radio" name="tf${index}" value="${q.correct ? 'correct' : 'wrong'}"> صح</label>
                        <label><input type="radio" name="tf${index}" value="${q.correct ? 'wrong' : 'correct'}"> خطأ</label>
                    </div>
                </div>
            `;
        });
        html += '</div>';
    }

    // أسئلة الإكمال
    if (quiz.fill && quiz.fill.length > 0) {
        html += '<div class="quiz-section"><h2 class="section-title">ثالثاً: أكمل الجمل الآتية</h2>';
        quiz.fill.forEach((q, index) => {
            html += `
                <div class="question">
                    <p class="question-text">${index + 1}. ${q.q}</p>
                    <div class="fill-answer">
                        <input type="text" name="fill${index}" placeholder="اكتب الإجابة هنا" class="fill-input">
                        <span class="correct-answer" style="display:none;">الإجابة الصحيحة: ${q.answer}</span>
                    </div>
                </div>
            `;
        });
        html += '</div>';
    }

    // أسئلة الوصل
    if (quiz.match && quiz.match.length > 0) {
        html += '<div class="quiz-section"><h2 class="section-title">رابعاً: أسئلة وصل (ضع الرقم داخل القوس)</h2>';
        quiz.match.forEach((q, index) => {
            html += `
                <div class="question">
                    <p class="question-text">${index + 1}. ${q.q} ( )</p>
                    <div class="options">
            `;
            q.options.forEach((option, optIndex) => {
                const isCorrect = optIndex === q.correct ? 'correct' : 'wrong';
                const letter = String.fromCharCode(0x0623 + optIndex); // أ، ب، ج، د، هـ
                html += `<label><input type="radio" name="match${index}" value="${isCorrect}"> ${letter}. ${option}</label>`;
            });
            html += '</div></div>';
        });
        html += '</div>';
    }

    // أسئلة مقالية (للفئة 9-12)
    if (quiz.essay && quiz.essay.length > 0) {
        html += '<div class="quiz-section"><h2 class="section-title">خامساً: أسئلة مقالية</h2>';
        quiz.essay.forEach((q, index) => {
            html += `
                <div class="question">
                    <p class="question-text">${index + 1}. ${q.q}</p>
                    <textarea name="essay${index}" class="essay-input" placeholder="اكتب إجابتك هنا..." rows="4"></textarea>
                    <div class="essay-sample" style="display:none; margin-top:10px; padding:10px; background:#f0f0f0; border-radius:8px;">
                        <strong>إجابة نموذجية:</strong> ${q.sample}
                    </div>
                </div>
            `;
        });
        html += '</div>';
    }

    html += `
        <button class="btn-submit" onclick="submitQuiz()">
            <i class="fas fa-check-circle"></i>
            تحقق من الإجابات
        </button>
        <div id="result" class="result"></div>
        <button class="btn-restart" onclick="restartStory()" style="display:none;" id="restartBtn">
            <i class="fas fa-redo"></i>
            ابدأ القصة من جديد
        </button>
    `;

    quizContainer.innerHTML = html;
}

// ========================================
// 🔊 وظائف التحكم بالصوت
// ========================================
function stopCurrentAudio() {
    if (currentPlayingAudio) {
        currentPlayingAudio.pause();
        currentPlayingAudio.currentTime = 0;
        currentPlayingAudio = null;
    }
}

function playPageAudio(pageNumber) {
    stopCurrentAudio();
    
    if (!audioEnabled) {
        return;
    }

    let audioToPlay = null;

    if (pageNumber >= 1 && pageNumber <= currentStoryData.pages.length) {
        audioToPlay = storyAudios[pageNumber];
    } else if (pageNumber === currentStoryData.pages.length + 1 && storyAudios[pageNumber]) {
        audioToPlay = storyAudios[pageNumber];
    } else if (pageNumber === currentStoryData.pages.length + 2 && quizAudio) {
        audioToPlay = quizAudio;
    }
    
    if (audioToPlay) {
        currentPlayingAudio = audioToPlay;
        currentPlayingAudio.play().catch(e => console.error("Error playing audio:", e));
        document.getElementById('audioControlBtn').classList.remove('muted');
        document.getElementById('audioIcon').classList.replace('fa-volume-mute', 'fa-volume-up');
    }
}

function toggleAudio() {
    const audioIcon = document.getElementById('audioIcon');
    const audioControlBtn = document.getElementById('audioControlBtn');

    if (currentPlayingAudio && !currentPlayingAudio.paused) {
        currentPlayingAudio.pause();
        audioControlBtn.classList.add('muted');
        audioIcon.classList.replace('fa-volume-up', 'fa-volume-mute');
    } else if (currentPlayingAudio && currentPlayingAudio.paused) {
        currentPlayingAudio.play();
        audioControlBtn.classList.remove('muted');
        audioIcon.classList.replace('fa-volume-mute', 'fa-volume-up');
    }
}

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

// ========================================
// ➡️ وظائف التنقل بين الصفحات
// ========================================
function showPage(pageIndex) {
    const pages = document.querySelectorAll('.book .page');
    
    pages.forEach(page => {
        page.classList.remove('active');
    });

    const targetPage = document.getElementById(`page-${pageIndex}`);
    if (targetPage) {
        targetPage.classList.add('active');
        currentPage = pageIndex;
    }

    playPageAudio(pageIndex);
    updatePageCounter();
    updateNavigationButtons();
}

function nextPage() {
    if (currentPage < totalPages - 1) {
        showPage(currentPage + 1);
    } else if (currentPage === totalPages - 1) {
        startQuiz();
    }
}

function prevPage() {
    if (currentPage > 0) {
        showPage(currentPage - 1);
    } else if (currentPage === 0) {
        showIntroPage();
    }
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    prevBtn.disabled = currentPage === 0;
    nextBtn.disabled = false;
}

function updatePageCounter() {
    document.getElementById('currentPage').textContent = currentPage + 1;
    document.getElementById('totalPages').textContent = totalPages;
}

// ========================================
// 🎬 وظائف التحكم في سير القصة
// ========================================
function startStory() {
    const introPage = document.getElementById('intro-page');
    const bookPage = document.getElementById('book-page');
    const audioCheckbox = document.getElementById('audio-checkbox');
    const audioControlBtn = document.getElementById('audioControlBtn');

    audioEnabled = audioCheckbox.checked;

    introPage.classList.remove('active');
    bookPage.classList.add('active');

    audioControlBtn.classList.add('active');
    if (audioEnabled) {
        audioControlBtn.classList.remove('muted');
        document.getElementById('audioIcon').classList.replace('fa-volume-mute', 'fa-volume-up');
    } else {
        audioControlBtn.classList.add('muted');
        document.getElementById('audioIcon').classList.replace('fa-volume-up', 'fa-volume-mute');
    }

    currentPage = 0;
    showPage(currentPage);
}

function showIntroPage() {
    document.getElementById('book-page').classList.remove('active');
    document.getElementById('quiz-page').classList.remove('active');
    document.getElementById('intro-page').classList.add('active');
    
    stopCurrentAudio();
    document.getElementById('audioControlBtn').classList.remove('active');
    document.getElementById('quizAudioBtn').classList.remove('active');
}

function startQuiz() {
    document.getElementById('book-page').classList.remove('active');
    document.getElementById('quiz-page').classList.add('active');
    
    stopCurrentAudio();
    document.getElementById('audioControlBtn').classList.remove('active');
    
    const quizAudioBtn = document.getElementById('quizAudioBtn');
    quizAudioBtn.classList.add('active');

    if (audioEnabled) {
        playPageAudio(currentStoryData.pages.length + 2);
        quizAudioBtn.classList.remove('muted');
        document.getElementById('quizAudioIcon').classList.replace('fa-volume-mute', 'fa-volume-up');
    } else {
        quizAudioBtn.classList.add('muted');
        document.getElementById('quizAudioIcon').classList.replace('fa-volume-up', 'fa-volume-mute');
    }
    
    document.getElementById('result').classList.remove('show', 'success', 'partial', 'fail');
    document.getElementById('restartBtn').style.display = 'none';
    document.querySelectorAll('#quiz-page input[type="radio"], #quiz-page input[type="text"], #quiz-page textarea').forEach(input => {
        if (input.type === 'radio') input.checked = false;
        else input.value = '';
    });
    
    document.querySelectorAll('.question').forEach(q => {
        q.style.background = 'rgba(123, 67, 151, 0.05)';
        q.style.borderColor = '#7b4397';
    });
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function submitQuiz() {
    const quiz = currentStoryData.quiz;
    let totalQuestions = 0;
    let correctAnswers = 0;
    
    // حساب أسئلة الاختيار من متعدد
    if (quiz.mcq) {
        quiz.mcq.forEach((q, index) => {
            totalQuestions++;
            const selected = document.querySelector(`input[name="mcq${index}"]:checked`);
            if (selected && selected.value === 'correct') {
                correctAnswers++;
                markQuestionCorrect(`input[name="mcq${index}"]`);
            } else if (selected) {
                markQuestionWrong(`input[name="mcq${index}"]`);
            }
        });
    }

    // حساب أسئلة صح أم خطأ
    if (quiz.tf) {
        quiz.tf.forEach((q, index) => {
            totalQuestions++;
            const selected = document.querySelector(`input[name="tf${index}"]:checked`);
            if (selected && selected.value === 'correct') {
                correctAnswers++;
                markQuestionCorrect(`input[name="tf${index}"]`);
            } else if (selected) {
                markQuestionWrong(`input[name="tf${index}"]`);
            }
        });
    }

    // حساب أسئلة الوصل
    if (quiz.match) {
        quiz.match.forEach((q, index) => {
            totalQuestions++;
            const selected = document.querySelector(`input[name="match${index}"]:checked`);
            if (selected && selected.value === 'correct') {
                correctAnswers++;
                markQuestionCorrect(`input[name="match${index}"]`);
            } else if (selected) {
                markQuestionWrong(`input[name="match${index}"]`);
            }
        });
    }

    // عرض النتيجة
    const resultDiv = document.getElementById('result');
    const restartBtn = document.getElementById('restartBtn');
    const percentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    
    let message = '';
    let resultClass = '';
    
    if (percentage === 100) {
        message = `🎉 ممتاز! لقد أجبت على جميع الأسئلة بشكل صحيح!<br>درجتك: ${correctAnswers}/${totalQuestions} (${percentage}%)<br>أنت بطل! فهمت القصة جيداً 🌟`;
        resultClass = 'success';
    } else if (percentage >= 70) {
        message = `👏 أحسنت! لقد أجبت بشكل جيد!<br>درجتك: ${correctAnswers}/${totalQuestions} (${percentage.toFixed(0)}%)<br>راجع الإجابات الخاطئة وحاول مرة أخرى 📚`;
        resultClass = 'partial';
    } else {
        message = `💪 حاول مرة أخرى!<br>درجتك: ${correctAnswers}/${totalQuestions} (${percentage.toFixed(0)}%)<br>اقرأ القصة مرة أخرى بتركيز أكبر 📖`;
        resultClass = 'fail';
    }
    
    resultDiv.innerHTML = message;
    resultDiv.className = `result ${resultClass} show`;
    restartBtn.style.display = 'block';
    
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function markQuestionCorrect(selector) {
    const questionElement = document.querySelector(selector).closest('.question');
    questionElement.style.background = 'rgba(76, 175, 80, 0.2)';
    questionElement.style.borderColor = '#4CAF50';
}

function markQuestionWrong(selector) {
    const questionElement = document.querySelector(selector).closest('.question');
    questionElement.style.background = 'rgba(244, 67, 54, 0.2)';
    questionElement.style.borderColor = '#f44336';
}

function restartStory() {
    stopCurrentAudio();
    if (quizAudio) quizAudio.pause();
    
    currentPage = 0;
    audioEnabled = false;
    
    document.getElementById('audio-checkbox').checked = false;
    showIntroPage();
    
    document.getElementById('result').classList.remove('show');
    document.getElementById('restartBtn').style.display = 'none';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goBackToList() {
    window.location.href = 'stories-list.html';
}

// ========================================
// ⌨️ التحكم بلوحة المفاتيح
// ========================================
document.addEventListener('keydown', function(event) {
    if (document.getElementById('book-page').classList.contains('active')) {
        if (event.key === 'ArrowRight') {
            prevPage();
        } else if (event.key === 'ArrowLeft') {
            nextPage();
        }
    }
});

