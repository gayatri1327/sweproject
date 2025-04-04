document.addEventListener("DOMContentLoaded", () => {
  // ===== Pincode Details Fetch and Display =====
  const regPincode = document.getElementById("regPincode");
  const pincodeInfo = document.getElementById("pincodeInfo");

  // Fetch pincode details from Flask endpoint whenever user inputs a pincode
  regPincode.addEventListener("input", () => {
    const enteredPin = regPincode.value.trim();

    // Show the info box immediately
    pincodeInfo.classList.remove("hidden");

    if (enteredPin.length === 6) {
      fetch(`/pincode?pin=${enteredPin}`)
        .then(response => response.json())
        .then(data => {
          if (data.error) {
            pincodeInfo.textContent = data.error;
            pincodeInfo.style.color = "#e74c3c";
          } else {
            // Format the output as needed.
            pincodeInfo.innerHTML = `
              <div class="pincode-details">
                <div class="pincode-row"><span class="pincode-label">Office Name:</span> ${data.OfficeName}</div>
                <div class="pincode-row"><span class="pincode-label">District:</span> ${data.District}</div>
                <div class="pincode-row"><span class="pincode-label">State:</span> ${data.StateName}</div>
                <div class="pincode-row"><span class="pincode-label">Pincode:</span> ${data.Pincode}</div>
              </div>
            `;
            pincodeInfo.style.color = "#2ecc71";
          }
        })
        .catch(err => {
          console.error("Error fetching pincode details:", err);
          pincodeInfo.textContent = "Error fetching data";
          pincodeInfo.style.color = "#e74c3c";
        });
    } else {
      pincodeInfo.textContent = "Enter 6-digit pincode";
      pincodeInfo.style.color = "#f39c12";
    }
  });

  // Second pincode input handler (detailed view)
  regPincode.addEventListener("input", () => {
    const enteredPin = regPincode.value.trim();
    pincodeInfo.classList.remove("hidden");
    
    if (enteredPin.length === 6) {
      const matches = pincodeDatabase.filter(item => item.Pincode === enteredPin);
      
      if (matches.length > 0) {
        const firstMatch = matches[0];
        pincodeInfo.innerHTML = `
          <div class="pincode-details">
            <div class="pincode-row"><span class="pincode-label">State:</span> ${firstMatch.StateName}</div>
            <div class="pincode-row"><span class="pincode-label">District:</span> ${firstMatch.District}</div>
            <div class="pincode-row"><span class="pincode-label">Division:</span> ${firstMatch.DivisionName}</div>
            <div class="pincode-row"><span class="pincode-label">Region:</span> ${firstMatch.RegionName}</div>
            <div class="pincode-row"><span class="pincode-label">Pincode:</span> ${firstMatch.Pincode}</div>
          </div>
        `;
        pincodeInfo.style.color = "#2ecc71";
      } else {
        pincodeInfo.textContent = "No matching pincode found";
        pincodeInfo.style.color = "#e74c3c";
      }
    } else {
      pincodeInfo.textContent = "Enter 6-digit pincode";
      pincodeInfo.style.color = "#f39c12";
    }
  });

  // ===== Modal and Authentication Elements =====
  const openModalBtn = document.getElementById("openModalBtn");
  const authContainer = document.getElementById("authContainer");
  const modalBox = authContainer.querySelector(".modal-box");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const heroSection = document.getElementById("heroSection");
  const heroGreeting = document.getElementById("heroGreeting");
  const heroSecondHeading = heroSection.querySelector("h2:nth-of-type(2)");
  const getStartedBtn = openModalBtn;
  const signOutBtn = document.getElementById("signOutBtn");
  const myInfoBtn = document.getElementById("myInfoBtn");
  const emergencyModal = document.getElementById("emergencyModal");
  const emergencyCloseBtn = document.getElementById("emergencyCloseBtn");
  const myInfoModal = document.getElementById("myInfoModal");
  const myInfoCloseBtn = document.getElementById("myInfoCloseBtn");
  const starttyping = document.getElementById("starttyping");

  const pharmacyModal = document.getElementById("pharmacyModal");
  const pharmacyCloseBtn = document.getElementById("pharmacyCloseBtn");
  const resultModal = document.getElementById("resultModal");
  const resultCloseBtn = document.getElementById("resultCloseBtn");
  const prescriptionModal = document.getElementById("prescriptionModal");
  const prescriptionCloseBtn = document.getElementById("prescriptionCloseBtn");

  // ===== Medical Records Elements =====
  const medicalRecordsBtn = document.getElementById("medicalRecordsBtn");
  const medicalRecordsSection = document.getElementById("medicalRecords");
  const recordsContainer = document.getElementById("recordsContainer");

  // ===== Emergency Link Handler =====
  document.getElementById('emergencyLink').addEventListener('click', (e) => {
    e.preventDefault();
    const user = localStorage.getItem('currentUser');
    
    if (!user) {
      localStorage.setItem('postLoginRedirect', 'emergency');
      showModal(authContainer);
    } else {
      showModal(emergencyModal);
    }
  });

  // ===== Modal Control Functions =====
  function showModal(modal) {
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('fade-in'), 10);
  }

  function hideModal(modal) {
    modal.classList.remove('fade-in');
    setTimeout(() => {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }, 300);
  }

  // ===== Get Started Button Logic =====
  openModalBtn.addEventListener("click", () => {
    const currentUserEmail = localStorage.getItem("currentUser");
    if (currentUserEmail) {
      emergencyModal.classList.remove("hidden");
      emergencyModal.classList.add("fade-in");
    } else {
      authContainer.classList.remove("hidden");
      authContainer.classList.add("fade-in");
      modalBox.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });

  // ===== Emergency Modal "Medical Records" Click Handler =====
  if (medicalRecordsBtn) {
    medicalRecordsBtn.addEventListener("click", (e) => {
      e.preventDefault();
      // Close My Information modal if open
      myInfoModal.classList.add("hidden");
      // Show medical records section
      medicalRecordsSection.classList.remove("hidden");
      // Scroll to medical records
      medicalRecordsSection.scrollIntoView({ 
        behavior: "smooth", 
        block: "start" 
      });
      // Refresh records display
      updateMedicalRecords();
    });
  }

  // ===== Auth Modal Close Button =====
  closeModalBtn.addEventListener("click", () => {
    authContainer.classList.add("hidden");
  });

  // ===== Toggle Between Login and Register Panels =====
const loginToggleBtn = document.getElementById("loginToggleBtn");
const registerToggleBtn = document.getElementById("registerToggleBtn");
registerToggleBtn.addEventListener("click", () => {
  modalBox.classList.add("right-panel-active");
});
loginToggleBtn.addEventListener("click", () => {
  modalBox.classList.remove("right-panel-active");
});

// ===== Multi-step Registration =====
const regStep1 = document.getElementById("regStep1");
const regStep2 = document.getElementById("regStep2");
const continueBtn = document.getElementById("continueBtn");
continueBtn.addEventListener("click", () => {
  const regEmail = document.getElementById("regEmail").value.trim();
  if (!regEmail.includes("@")) {
    alert("Please enter a valid email containing '@'.");
    return;
  }
  regStep1.classList.add("hidden");
  regStep2.classList.remove("hidden");
});

// ===== Registration Form Submission =====
const registerFormStep2 = document.getElementById("regStep2");
registerFormStep2.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("regName").value.trim();
  const age = document.getElementById("regAge").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const weight = document.getElementById("regWeight").value.trim();
  const pincode = regPincode.value.trim();
  const password = document.getElementById("regPassword").value.trim();
  const confirm = document.getElementById("regConfirm").value.trim();
  if (!name || !age || !email || !weight || !pincode) {
    alert("Name, Age, Email, Weight, and Pincode are required.");
    return;
  }
  if (!email.includes("@")) {
    alert("Please enter a valid email containing '@'.");
    return;
  }
  if (password !== confirm) {
    alert("Passwords do not match. Please try again.");
    return;
  }
  const user = {
    name,
    age,
    email,
    weight,
    pincode,
    password,
    phone: document.getElementById("regPhone").value.trim() || "-"
  };
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("currentUser", email);
  updateHeroAfterLogin(name);
  
  // Handle post-registration redirects
  const redirect = localStorage.getItem('postLoginRedirect');
  localStorage.removeItem('postLoginRedirect');
  
  if (redirect === 'emergency') {
    hideModal(authContainer);
    showModal(emergencyModal);
  } else if (redirect === 'medicalRecords') {
    medicalRecordsSection.classList.remove("hidden");
    medicalRecordsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    updateMedicalRecords();
  } else if (redirect === 'myInfo') {
    myInfoModal.classList.remove("hidden");
    myInfoModal.classList.add("fade-in");
  } else {
    alert("Registration successful!");
  }
});

// ===== My Information Modal with Auth Check =====
if (myInfoBtn && myInfoModal) {
  myInfoBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const currentUser = localStorage.getItem('currentUser');
    
    if (!currentUser) {
      localStorage.setItem('postLoginRedirect', 'myInfo');
      showModal(authContainer);
    } else {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        myInfoModal.querySelector("#infoName").textContent = user.name;
        myInfoModal.querySelector("#infoAge").textContent = user.age;
        myInfoModal.querySelector("#infoPhone").textContent = user.phone || "-";
        myInfoModal.querySelector("#infoEmail").textContent = user.email;
        myInfoModal.querySelector("#infoWeight").textContent = user.weight;
        myInfoModal.querySelector("#infoPincode").textContent = user.pincode;
      }
      myInfoModal.classList.remove("hidden");
      myInfoModal.classList.add("fade-in");
    }
  });
}

if (myInfoCloseBtn) {
  myInfoCloseBtn.addEventListener("click", () => {
    myInfoModal.classList.add("hidden");
  });
}

if (starttyping) {
  starttyping.addEventListener("click", () => {
    emergencyModal.classList.add("hidden");
  });
}
  // ===== Featured Section: Previous Medical Records =====
document.querySelectorAll('.card.clickable').forEach(card => {
  const title = card.querySelector('h4').textContent;
  if (title === 'Previous Medical Records') {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const user = localStorage.getItem('currentUser');
      if (!user) {
        localStorage.setItem('postLoginRedirect', 'medicalRecords');
        showModal(authContainer);
      } else {
        medicalRecordsSection.classList.remove("hidden");
        medicalRecordsSection.scrollIntoView({ behavior: "smooth", block: "start" });
        updateMedicalRecords();
      }
    });
  }
});

  // ===== Registration Modal Close Button =====
  const regCloseBtn = document.getElementById("regCloseBtn");
  if (regCloseBtn) {
    regCloseBtn.addEventListener("click", () => {
      authContainer.classList.add("hidden");
    });
  }

  // ===== Login Form Submission =====
  const loginForm = document.getElementById("loginForm");
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.email === email && user.password === password) {
        localStorage.setItem("currentUser", email);
        updateHeroAfterLogin(user.name);
      
        if (localStorage.getItem('postLoginRedirect') === 'emergency') {
          localStorage.removeItem('postLoginRedirect');
          hideModal(authContainer);
          showModal(emergencyModal);
        } else if (localStorage.getItem('postLoginRedirect') === 'medicalRecords') {
          localStorage.removeItem('postLoginRedirect');
          medicalRecordsSection.classList.remove("hidden");
          medicalRecordsSection.scrollIntoView({ behavior: "smooth", block: "start" });
          updateMedicalRecords();
        } else {
          alert("Login successful!");
        }
      } else {
        alert("Invalid email or password.");
      }
    } else {
      alert("No registered user found. Please register first.");
    }
  });

  // ===== Sign Out Functionality =====
  signOutBtn.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    alert("Signed out successfully!");
    window.location.reload();
  });

  // ===== Emergency Modal Close Button =====
  if (emergencyCloseBtn) {
    emergencyCloseBtn.addEventListener("click", () => {
      emergencyModal.classList.add("hidden");
    });
  }

  // ===== "My Information" Modal =====
  if (myInfoBtn && myInfoModal) {
    myInfoBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const currentUser = localStorage.getItem('currentUser');
        
        if (!currentUser) {
            localStorage.setItem('postLoginRedirect', 'myInfo');
            showModal(authContainer);
        } else {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                const user = JSON.parse(storedUser);
                myInfoModal.querySelector("#infoName").textContent = user.name;
                myInfoModal.querySelector("#infoAge").textContent = user.age;
                myInfoModal.querySelector("#infoPhone").textContent = user.phone || "-";
                myInfoModal.querySelector("#infoEmail").textContent = user.email;
                myInfoModal.querySelector("#infoWeight").textContent = user.weight;
                myInfoModal.querySelector("#infoPincode").textContent = user.pincode;
            }
            myInfoModal.classList.remove("hidden");
            myInfoModal.classList.add("fade-in");
        }
    });
}

if (myInfoCloseBtn) {
    myInfoCloseBtn.addEventListener("click", () => {
        myInfoModal.classList.add("hidden");
    });
}

if (starttyping) {
    starttyping.addEventListener("click", () => {
        emergencyModal.classList.add("hidden");
    });
}

  // ===== Editable Fields in My Information Modal =====
  const userFields = {
    age: document.getElementById("infoAge"),
    weight: document.getElementById("infoWeight")
  };

  Object.entries(userFields).forEach(([key, element]) => {
    element.addEventListener("click", () => {
      const value = element.textContent;
      element.innerHTML = `<input type="text" value="${value}" style="width: 60px">`;
      element.querySelector("input").focus();
    });

    element.addEventListener("blur", (e) => {
      const newValue = e.target.value;
      element.textContent = newValue;
      const user = JSON.parse(localStorage.getItem("user"));
      user[key] = newValue;
      localStorage.setItem("user", JSON.stringify(user));
    });
  });

  // ===== Change Password Functionality =====
  const changePasswordBtn = document.getElementById("changePasswordBtn");
  if (changePasswordBtn) {
    changePasswordBtn.addEventListener("click", () => {
      const oldPassword = prompt("Enter your old password:");
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (oldPassword !== storedUser.password) {
        alert("Old password is incorrect.");
        return;
      }
      const newPassword = prompt(
        "Enter your new password (at least 6 characters, containing letters and numbers):"
      );
      const confirmPassword = prompt("Confirm your new password:");
      const strongPasswordRegex = /^(?=.[A-Za-z])(?=.\d)[A-Za-z\d]{6,}$/;
      if (newPassword !== confirmPassword) {
        alert("New passwords do not match.");
        return;
      }
      if (!strongPasswordRegex.test(newPassword)) {
        alert("Password is not strong enough.");
        return;
      }
      storedUser.password = newPassword;
      localStorage.setItem("user", JSON.stringify(storedUser));
      alert("Password changed successfully!");
    });
  }

  // ===== Featured Section: Near Pharmacies =====
  const nearPharmaciesCard = document.querySelector(".card.clickable");
  if (nearPharmaciesCard && pharmacyModal) {
    nearPharmaciesCard.addEventListener("click", () => {
      pharmacyModal.classList.remove("hidden");
      pharmacyModal.classList.add("fade-in");
    });
  }
  if (pharmacyCloseBtn) {
    pharmacyCloseBtn.addEventListener("click", () => {
      pharmacyModal.classList.add("hidden");
    });
  }
  const pharmacyForm = document.getElementById("pharmacyForm");
if (pharmacyForm) {
  pharmacyForm.addEventListener("submit", function(e) {
    e.preventDefault();
    // Clean input: remove .0 and non-numeric characters
    const pincode = document.getElementById("pharmacyPincode").value
        .replace(/\.0$/, '')  // Remove trailing .0
        .replace(/\D/g, '')   // Remove non-digits
        .substring(0, 6);     // Limit to 6 digits
    
    fetch(`/search_hospitals?pincode=${encodeURIComponent(pincode)}`)
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    })
    .then(data => {
        const resultsContainer = document.getElementById("pharmacyResults");
        resultsContainer.innerHTML = '';
        
        if (data.error || data.message) {
            // ... existing error handling ...
        }
        
        data.hospitals.forEach(hospital => {
            const hospitalDiv = document.createElement("div");
            hospitalDiv.className = "hospital-result";
            hospitalDiv.innerHTML = `
    <h4>🏥 ${hospital.name || 'Name Not Available'}</h4>
    <div class="hospital-details">
        <p><strong>State:</strong> ${hospital.state || '-'}</p>
        <p><strong>City:</strong> ${hospital.city || '-'}</p>
        <p><strong>Address:</strong> ${hospital.address || 'Address Not Available'}</p>
        <p><strong>Pincode:</strong> ${hospital.pincode || 'N/A'}</p>
    </div>
`;
            resultsContainer.appendChild(hospitalDiv);
        });
    })
            .catch(error => {
                console.error("Error:", error);
                document.getElementById("pharmacyResults").innerHTML = 
                    `<p class="error">Error fetching hospital data</p>`;
            });
    });
}

  // ===== "Stores" Click Handler =====
  document.querySelector("[href='#stores']").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("stores").scrollIntoView({ behavior: "smooth" });
    pharmacyModal.classList.remove("hidden");
    pharmacyModal.classList.add("pharmacy-modal");
  });
  

  // ===== Auto-login =====
  const currentUserEmail = localStorage.getItem("currentUser");
  const storedUserData = localStorage.getItem("user");
  if (currentUserEmail && storedUserData) {
    const user = JSON.parse(storedUserData);
    if (user.email === currentUserEmail) {
      updateHeroAfterLogin(user.name);
      if (localStorage.getItem('postLoginRedirect') === 'emergency') {
        localStorage.removeItem('postLoginRedirect');
        showModal(emergencyModal);
      }
    }
  }

  // ===== Navigation Mouseover Glow Effect =====
  const navLinks = document.querySelectorAll("nav ul li a");
  navLinks.forEach(link => {
    link.addEventListener("mouseover", () => {
      link.style.textShadow = "0 0 8px #fff";
    });
    link.addEventListener("mouseout", () => {
      link.style.textShadow = "none";
    });
  });

  // ===== Result Modal Close Button =====
  if (resultCloseBtn) {
    resultCloseBtn.addEventListener("click", () => {
      resultModal.classList.add("hidden");
    });
  }

  // ===== Prescription Modal Close Button =====
  if (prescriptionCloseBtn) {
    prescriptionCloseBtn.addEventListener("click", () => {
      prescriptionModal.classList.add("hidden");
    });
  }

  // ===== PDF Download Handler using FPDF =====
  async function generatePDF() {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const prescriptionData = {
        name: user.name,
        weight: user.weight,
        date: new Date().toISOString().split('T')[0],
        disease: document.getElementById("prescriptionDisease").textContent,
        description: document.getElementById("prescriptionDescription").textContent,
        precautions: document.getElementById("prescriptionPrecautions").textContent.split(", "),
        medications: Array.from(document.querySelectorAll("#prescriptionMeds li")).map(li => li.textContent),
        diet: document.getElementById("prescriptionDiet").textContent.split(", "),
        workout: document.getElementById("prescriptionWorkout").textContent.split(", ")
      };

      const response = await fetch('/generate_pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(prescriptionData)
      });

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${user.name.replace(/\s+/g, '_')}_prescription.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error("PDF download failed:", error);
      alert("Failed to download PDF. Please try again.");
    }
  }

  // Attach PDF download event listener
  document.getElementById('downloadPrescription').addEventListener('click', async (e) => {
    e.preventDefault();
    await generatePDF();
  });

  // ===== Prediction Form Submission =====
  const predictForm = document.getElementById("predictForm");
  if (predictForm) {
    predictForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      // Get symptoms from autocomplete array
      const symptoms = selectedSymptoms; // Using the autocomplete array
      
      if (symptoms.length === 0) {
        document.getElementById("predictMessage").textContent = "Please select at least 1 symptom.";
        return;
      }
      try {
        const response = await fetch("/predict", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ symptoms: symptoms.join(",") })
        });
        const result = await response.json();
        const user = JSON.parse(localStorage.getItem("user"));
        let prescriptionCount = localStorage.getItem("prescriptionCount") || 1;

        // Populate prescription data
        document.getElementById("prescriptionDisease").textContent = result.disease;
        document.getElementById("prescriptionDescription").textContent = result.description;
        document.getElementById("prescriptionPrecautions").textContent = result.precautions.join(", ");
        document.getElementById("prescriptionWorkout").textContent = result.workout.join(", ");
        document.getElementById("prescriptionDiet").textContent = result.diet.join(", ");
        document.getElementById("prescriptionName").textContent = user.name;
        document.getElementById("prescriptionWeight").textContent = `${user.weight} kg`;
        document.getElementById("prescriptionDate").textContent = new Date().toISOString().split('T')[0];

        // Populate medications list
        const medsList = document.getElementById("prescriptionMeds");
        medsList.innerHTML = result.medications.map(med => `<li>${med}</li>`).join('');

        // Set download link filename (PDF will be generated later)
        const downloadLink = document.getElementById("downloadPrescription");
        downloadLink.download = `${user.name.replace(/\s+/g, '_')}_prescription_${prescriptionCount}.pdf`;

        // Show prescription modal
        emergencyModal.classList.add("hidden");
        prescriptionModal.classList.remove("hidden");
        prescriptionModal.classList.add("fade-in");

        // Reset autocomplete array and input
        selectedSymptoms = [];
        symptomInput.value = "";

        // Save the medical record using the selected symptoms array
        saveMedicalRecord(symptoms);

        localStorage.setItem("prescriptionCount", parseInt(prescriptionCount) + 1);
      } catch (error) {
        console.error("Prediction error:", error);
        document.getElementById("predictMessage").textContent = "Error generating prescription.";
      }
    });
  }

  // ===== Medical Records Functionality =====
  function updateMedicalRecords() {
    recordsContainer.innerHTML = "";
    const records = JSON.parse(localStorage.getItem("medicalRecords") || "[]");
    if (records.length === 0) {
      recordsContainer.innerHTML = `<p class="no-records">No medical records found</p>`;
      return;
    }
    records.forEach(record => {
      const recordEl = document.createElement("div");
      recordEl.className = "record-item";
      recordEl.innerHTML = `
        <div class="record-header">
          <span class="record-date">${record.date}</span>
          <button class="delete-record" data-id="${record.id}">×</button>
        </div>
        <div class="record-content">
          <h4 class="record-disease">${record.content.disease}</h4>
          <p><strong>Symptoms:</strong> ${Array.isArray(record.symptoms) ? record.symptoms.join(", ") : record.symptoms}</p>
          <div class="record-details">
            <p><strong>Medications:</strong> ${record.content.medications.join(", ")}</p>
            <p><strong>Precautions:</strong> ${record.content.precautions.join(", ")}</p>
            <p><strong>Workout:</strong> ${record.content.workout.join(", ")}</p>
            <p><strong>Diet:</strong> ${record.content.diet.join(", ")}</p>
          </div>
        </div>
      `;
      recordsContainer.appendChild(recordEl);
    });
  }

  recordsContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-record")) {
      const id = Number(e.target.dataset.id);
      const records = JSON.parse(localStorage.getItem("medicalRecords") || "[]");
      const updatedRecords = records.filter(r => r.id !== id);
      localStorage.setItem("medicalRecords", JSON.stringify(updatedRecords));
      updateMedicalRecords();
      e.target.parentElement.style.transform = "scale(0)";
      setTimeout(() => {
        e.target.parentElement.remove();
      }, 300);
    }
  });

  // ===== Modified saveMedicalRecord Function =====
  function saveMedicalRecord(symptoms) {
    const dateOptions = { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };

    const record = {
      id: Date.now(),
      date: new Date().toLocaleString('en-US', dateOptions),
      symptoms: symptoms,
      content: {
        disease: document.getElementById("prescriptionDisease").textContent,
        description: document.getElementById("prescriptionDescription").textContent,
        medications: Array.from(document.querySelectorAll("#prescriptionMeds li")).map(li => li.textContent),
        precautions: document.getElementById("prescriptionPrecautions").textContent.split(", "),
        workout: document.getElementById("prescriptionWorkout").textContent.split(", "),
        diet: document.getElementById("prescriptionDiet").textContent.split(", ")
      }
    };
    const existingRecords = JSON.parse(localStorage.getItem("medicalRecords") || "[]");
    const updatedRecords = [record, ...existingRecords];
    localStorage.setItem("medicalRecords", JSON.stringify(updatedRecords));
    updateMedicalRecords();
  }

  // Initialize Medical Records if a User is Logged In
  const currentUser = localStorage.getItem("currentUser");
  if (currentUser) {
    updateMedicalRecords();
  }

  // ===== Helper Function to Update Hero Section =====
  function updateHeroAfterLogin(name) {
    heroGreeting.textContent = "Hello";
    heroSecondHeading.textContent = name;
    getStartedBtn.textContent = "Enter your problem";
    signOutBtn.classList.remove("hidden");
    authContainer.classList.add("hidden");
  }
});

// ===== Autocomplete for Symptoms =====
const symptomsList = [
  'abdominal_pain', 'abnormal_menstruation', 'acidity', 'acne', 'allergy', 'anxiety',
  'blackheads', 'blood_in_sputum', 'blister', 'bruising', 'burning_micturition',
  'chest_pain', 'chills', 'cold_hands_and_feets', 'constipation', 'continuous_sneezing',
  'cough', 'dark_urine', 'dehydration', 'diarrhoea', 'dischromic _patches', 'dizziness',
  'drying_and_tingling_lips', 'fatigue', 'fast_heart_rate', 'high_fever', 'hip_joint_pain',
  'increased_appetite', 'indigestion', 'irregular_sugar_level', 'joint_pain', 'lethargy',
  'loss_of_appetite', 'loss_of_balance', 'loss_of_smell', 'mild_fever', 'mood_swings',
  'malaise', 'muscle_pain', 'muscle_wasting', 'nodal_skin_eruptions', 'obesity',
  'patches_in_throat', 'palpitations', 'phlegm', 'red_sore_around_nose', 'redness_of_eyes',
  'restlessness', 'runny_nose', 'skin_peeling', 'sweating', 'stiff_neck', 'stomach_pain',
  'spotting_urination', 'throat_irritation', 'vomiting', 'weight_gain', 'weight_loss',
  'yellow_crust_ooze', 'yellowish_skin',
  
  // Additional symptoms:
  'itching', 'skin_rash', 'shivering', 'ulcers_on_tongue', 'sunken_eyes', 'breathlessness',
  'headache', 'nausea', 'pain_behind_the_eyes', 'back_pain', 'yellow_urine', 'yellowing_of_eyes',
  'acute_liver_failure', 'fluid_overload', 'swelling_of_stomach', 'swelled_lymph_nodes',
  'blurred_and_distorted_vision', 'sinus_pressure', 'congestion', 'weakness_in_limbs',
  'pain_during_bowel_movements', 'pain_in_anal_region', 'bloody_stool', 'irritation_in_anus',
  'neck_pain', 'cramps', 'swollen_legs', 'swollen_blood_vessels', 'puffy_face_and_eyes',
  'enlarged_thyroid', 'brittle_nails', 'swollen_extremeties', 'excessive_hunger', 'extra_marital_contacts',
  'slurred_speech', 'knee_pain', 'muscle_weakness', 'swelling_joints', 'movement_stiffness',
  'spinning_movements', 'unsteadiness', 'bladder_discomfort', 'foul_smell_of_urine', 'continuous_feel_of_urine',
  'passage_of_gases', 'internal_itching', 'toxic_look_(typhos)', 'depression', 'irritability',
  'altered_sensorium', 'red_spots_over_body', 'belly_pain', 'watering_from_eyes', 'polyuria',
  'family_history', 'mucoid_sputum', 'rusty_sputum', 'lack_of_concentration', 'visual_disturbances',
  'receiving_blood_transfusion', 'receiving_unsterile_injections', 'coma', 'stomach_bleeding',
  'distention_of_abdomen', 'history_of_alcohol_consumption', 'prominent_veins_on_calf', 'painful_walking',
  'pus_filled_pimples', 'scurring', 'silver_like_dusting', 'small_dents_in_nails', 'inflammatory_nails',
  'prognosis'
];

const symptomInput = document.getElementById('symptomInput');
const suggestions = document.getElementById('suggestions');
let selectedSymptoms = [];

function updateSuggestions(searchTerm) {
  suggestions.innerHTML = '';
  if (selectedSymptoms.length > 4) return;
  const filtered = symptomsList.filter(symptom =>
    symptom.toLowerCase().startsWith(searchTerm.toLowerCase())
  );
  filtered.forEach(symptom => {
    const div = document.createElement('div');
    div.className = 'suggestion-item';
    div.textContent = symptom;
    div.onclick = () => selectSymptom(symptom);
    suggestions.appendChild(div);
  });
  suggestions.style.display = filtered.length ? 'block' : 'none';
}

function selectSymptom(symptom) {
  if (selectedSymptoms.length < 4 && !selectedSymptoms.includes(symptom)) {
    selectedSymptoms.push(symptom);
    symptomInput.value = selectedSymptoms.join(', ') + ', ';
    suggestions.style.display = 'none';
    symptomInput.focus();
  }
}

symptomInput.addEventListener('input', (e) => {
  const parts = e.target.value.split(/,\s*/);
  const currentInput = parts.pop()?.trim().replace(/ /g, '_') || '';
  updateSuggestions(currentInput);
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.symptom-input-container')) {
    suggestions.style.display = 'none';
  }
});

symptomInput.addEventListener('keydown', (e) => {
  if (e.key === 'Backspace' && symptomInput.selectionStart === symptomInput.selectionEnd) {
    const cursorPos = symptomInput.selectionStart;
    const currentValue = symptomInput.value;
    if (cursorPos === currentValue.length && selectedSymptoms.length > 0) {
      selectedSymptoms = selectedSymptoms.slice(0, -1);
      symptomInput.value = selectedSymptoms.join(', ');
    }
  }
});
