const app = require('./api/index');
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n🚗  Car Rental System running at http://localhost:${PORT}`);
  console.log(`   Press Ctrl+C to stop.\n`);
});
