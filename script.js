const video = document.getElementById('video');
const captureButton = document.getElementById('capture');
const takeAttendanceButton = document.getElementById('take-attendance');
const stopButton = document.getElementById('stop');
const modal = document.getElementById('modal');
const yesButton = document.getElementById('yes');
const noButton = document.getElementById('no');
const attendanceRecordsBody = document.getElementById('attendance-records-body');
const attendanceForm = document.getElementById('attendance-form');
const studentNameInput = document.getElementById('student-name');
const modalStudentName = document.getElementById('modal-student-name');
const newAttendanceMessage = document.getElementById('new-attendance-message');
const attendanceTakenMessage = document.getElementById('attendance-taken-message');
const exportToExcelButton = document.getElementById('export-to-excel');
const passwordModal = document.getElementById('password-modal');
const passwordInput = document.getElementById('password-input');
const passwordSubmitButton = document.getElementById('password-submit');
const passwordError = document.getElementById('password-error');
let studentName = '';
let mediaStream = null;
let attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
let deleteIndex = null;
const deletePassword = 'Swapnil21';

function accessWebcam() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            mediaStream = stream;
            video.srcObject = stream;
            video.play();
        })
        .catch(error => {
            console.error('Error accessing webcam:', error);
        });
}

function capturePhoto() {
    const canvas = document.createElement('canvas');
    canvas.width = video.width;
    canvas.height = video.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL();
    studentName = studentNameInput.value;
    modalStudentName.textContent = studentName;
    modal.style.display = 'block';

    const attendanceRecord = {
        studentName: studentName,
        attendanceDate: new Date().toLocaleDateString(),
        attendanceTime: new Date().toLocaleTimeString(),
        attendanceStatus: 'Present',
        image: imageData
    };

    attendanceRecords.push(attendanceRecord);
    localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
    updateAttendanceRecords();
}

function confirmAttendance() {
    modal.style.display = 'none';
    attendanceForm.reset();
    studentNameInput.focus();
    attendanceTakenMessage.style.display = 'block';
    setTimeout(() => {
        attendanceTakenMessage.style.display = 'none';
    }, 3000);
}

function updateAttendanceRecords() {
    attendanceRecordsBody.innerHTML = '';
    attendanceRecords.forEach((record, index) => {
        attendanceRecordsBody.innerHTML += `
            <tr>
                <td>${record.studentName}</td>
                <td>${record.attendanceDate}</td>
                <td>${record.attendanceTime}</td>
                <td>${record.attendanceStatus}</td>
                <td><img src="${record.image}" width="100" height="100"></td>
                <td><button class="btn btn-danger delete-button" data-index="${index}">Delete</button></td>
            </tr>
        `;
    });

    const deleteButtons = document.querySelectorAll('.delete-button');
    deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
            deleteIndex = button.getAttribute('data-index');
            passwordModal.style.display = 'block';
        });
    });
}

function cancelAttendance() {
    modal.style.display = 'none';
    studentNameInput.focus();
}

function stopVideoStream() {
    if (mediaStream !== null) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
        document.getElementById('video-container').style.display = 'none';
    }
}

function exportToExcel() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance Records');

    worksheet.addRow(['Student Name', 'Attendance Date', 'Attendance Time', 'Attendance Status']);
    attendanceRecords.forEach(record => {
        worksheet.addRow([record.studentName, record.attendanceDate, record.attendanceTime, record.attendanceStatus]);
    });

    workbook.xlsx.writeBuffer()
        .then(buffer => {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, 'attendance-records.xlsx');
        })
        .catch(error => {
            console.error('Error exporting to Excel:', error);
        });
}

function submitPassword() {
    if (passwordInput.value === deletePassword) {
        attendanceRecords.splice(deleteIndex, 1);
        localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
        updateAttendanceRecords();
        passwordModal.style.display = 'none';
        passwordInput.value = '';
        passwordError.style.display = 'none';
    } else {
        passwordError.style.display = 'block';
        setTimeout(() => {
            passwordError.style.display = 'none';
        }, 3000);
    }
}

takeAttendanceButton.addEventListener('click', (e) => {
    e.preventDefault();
    if (studentNameInput.value !== '') {
        accessWebcam();
        document.getElementById('video-container').style.display = 'block';
    } else {
        studentNameInput.focus();
        newAttendanceMessage.style.display = 'block';
        setTimeout(() => {
            newAttendanceMessage.style.display = 'none';
        }, 3000);
    }
});
captureButton.addEventListener('click', capturePhoto);
yesButton.addEventListener('click', confirmAttendance);
noButton.addEventListener('click', cancelAttendance);
stopButton.addEventListener('click', stopVideoStream);
exportToExcelButton.addEventListener('click', exportToExcel);
passwordSubmitButton.addEventListener('click', submitPassword);
updateAttendanceRecords();
