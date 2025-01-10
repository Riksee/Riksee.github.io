const categories = [];
const percentages = [];

const categoryInput = document.getElementById('category');
const percentageInput = document.getElementById('percentage');
const totalBudgetInput = document.getElementById('total-budget');
const addButton = document.getElementById('add-button');
const tableBody = document.querySelector('#budget-table tbody');
const barChartCanvas = document.getElementById('barChart');
const pieChartCanvas = document.getElementById('pieChart');
const exportButton = document.getElementById('export-button');
const importButton = document.getElementById('import-button');
const fileInput = document.getElementById('file-input');


let barChart, pieChart;

exportButton.addEventListener('click', () => {
  const data = {
    categories,
    percentages,
    totalBudget: totalBudgetInput.value,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'budget_data.json';
  a.click();

  URL.revokeObjectURL(url);
});

// Trigger file input when clicking 'Load Data from File' button
importButton.addEventListener('click', () => {
  fileInput.click();
});

// Load data from a file
fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);

        if (data.categories && data.percentages && data.totalBudget) {
          categories.length = 0;
          percentages.length = 0;

          categories.push(...data.categories);
          percentages.push(...data.percentages);
          totalBudgetInput.value = data.totalBudget;

          updateTable();
          updateCharts();
          saveData();

          alert('Data loaded successfully!');
        } else {
          alert('Invalid file format.');
        }
      } catch (error) {
        alert('Error reading file. Please ensure it is a valid JSON file.');
      }
    };

    reader.readAsText(file);
  }
});

addButton.addEventListener('click', () => {
  const category = categoryInput.value.trim();
  const percentage = parseFloat(percentageInput.value);

  if (category && percentage >= 0 && percentage <= 100) {
    const totalPercentage = percentages.reduce((sum, current) => sum + current, 0) + percentage;

    if (totalPercentage > 100) {
      alert('The total percentage exceeds 100%! Please adjust your entries.');
      return; // Stop adding the new entry
    }

    categories.push(category);
    percentages.push(percentage);

    categoryInput.value = '';
    percentageInput.value = '';

    updateTable();
    updateCharts();
    saveData();
  } else {
    alert('Please enter a valid category and percentage (0-100).');
  }
});


function updateTable() {
  tableBody.innerHTML = '';
  categories.forEach((category, index) => {
    const row = document.createElement('tr');
    const percentage = percentages[index];
    const amount = (totalBudgetInput.value * (percentage / 100)).toFixed(2);

    row.innerHTML = `
      <td>${category}</td>
      <td>${percentage}</td>
      <td>${amount}</td>
      <td>
        <button onclick="editEntry(${index})">Edit</button>
        <button onclick="deleteEntry(${index})">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

function editEntry(index) {
  categoryInput.value = categories[index];
  percentageInput.value = percentages[index];
  deleteEntry(index);
}

function deleteEntry(index) {
  categories.splice(index, 1);
  percentages.splice(index, 1);
  updateTable();
  updateCharts();
  saveData();
}

function updateCharts() {
  if (barChart) barChart.destroy();
  if (pieChart) pieChart.destroy();

  barChart = new Chart(barChartCanvas, {
    type: 'bar',
    data: {
      labels: categories,
      datasets: [
        {
          label: 'Budget Percentage',
          data: percentages,
          backgroundColor: generateColors(percentages.length),
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  });

  pieChart = new Chart(pieChartCanvas, {
    type: 'pie',
    data: {
      labels: categories,
      datasets: [
        {
          data: percentages,
          backgroundColor: generateColors(percentages.length),
        },
      ],
    },
    options: {
      responsive: true,
    },
  });
}

function generateColors(count) {
  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(`hsl(${Math.random() * 360}, 70%, 70%)`);
  }
  return colors;
}

// function saveData() {
//   const data = {
//     categories,
//     percentages,
//     totalBudget: totalBudgetInput.value,
//   };
//   localStorage.setItem('budgetData', JSON.stringify(data));
// }

// function loadData() {
//   const savedData = localStorage.getItem('budgetData');
//   if (savedData) {
//     const { categories: savedCategories, percentages: savedPercentages, totalBudget } = JSON.parse(savedData);
//     categories.push(...savedCategories);
//     percentages.push(...savedPercentages);
//     totalBudgetInput.value = totalBudget;
//     updateTable();
//     updateCharts();
//   }
// }

// window.addEventListener('load', loadData);