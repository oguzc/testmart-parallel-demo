#!/usr/bin/env node

/**
 * 🎭 BAD vs GOOD Architecture Demo Runner
 * 
 * This script demonstrates the difference between bad and good parallel testing architecture
 * by running the same tests with different approaches and showing the results.
 * 
 * Usage:
 *   npm run demo:bad-architecture    # Show failing parallel tests
 *   npm run demo:good-architecture   # Show working parallel tests
 *   npm run demo:comparison          # Run both and compare results
 */

const { execSync } = require('child_process');
const path = require('path');

class ArchitectureDemo {
  
  static async runBadArchitectureDemo() {
    console.log('\n🔥 RUNNING BAD ARCHITECTURE DEMO');
    console.log('=====================================');
    console.log('This will demonstrate common parallel testing failures...\n');
    
    try {
      // Run bad architecture tests with multiple workers
      const result = execSync(
        'npx playwright test tests/examples/bad-architecture/ --workers=4 --reporter=list',
        { 
          cwd: process.cwd(),
          encoding: 'utf8',
          stdio: 'pipe'
        }
      );
      
      console.log('❌ UNEXPECTED: Bad tests passed (they should fail in parallel!)');
      console.log(result);
      
    } catch (error) {
      console.log('✅ EXPECTED: Bad architecture tests failed in parallel execution');
      console.log('🎯 Common issues demonstrated:');
      console.log('   - Shared state conflicts between workers');
      console.log('   - Race conditions on global variables');
      console.log('   - "Email already exists" errors');
      console.log('   - "Username already taken" conflicts');
      console.log('   - Unpredictable test results\n');
      
      // Show specific error patterns
      const errorOutput = error.stdout || error.message;
      const lines = errorOutput.split('\n').slice(0, 20); // Show first 20 lines
      console.log('📋 Sample Error Output:');
      console.log('------------------------');
      lines.forEach(line => {
        if (line.includes('Error') || line.includes('failed') || line.includes('✘')) {
          console.log(`🔴 ${line}`);
        }
      });
    }
  }

  static async runGoodArchitectureDemo() {
    console.log('\n✅ RUNNING GOOD ARCHITECTURE DEMO');
    console.log('=====================================');
    console.log('This will demonstrate proper parallel testing patterns...\n');
    
    try {
      const result = execSync(
        'npx playwright test tests/examples/good-architecture/ --workers=4 --reporter=list',
        { 
          cwd: process.cwd(),
          encoding: 'utf8',
          stdio: 'pipe'
        }
      );
      
      console.log('✅ SUCCESS: Good architecture tests passed in parallel!');
      console.log('🎯 Key patterns demonstrated:');
      console.log('   ✅ Worker-specific test data generation');
      console.log('   ✅ No shared global state');
      console.log('   ✅ Independent test execution');
      console.log('   ✅ Reliable, predictable results');
      console.log('   ✅ Scales to any number of workers\n');
      
      // Show success metrics
      const lines = result.split('\n');
      const passedTests = lines.filter(line => line.includes('✓') || line.includes('passed'));
      console.log('📊 Test Results:');
      console.log('----------------');
      passedTests.slice(0, 10).forEach(line => {
        console.log(`🟢 ${line.trim()}`);
      });
      
    } catch (error) {
      console.log('❌ UNEXPECTED: Good tests failed (they should pass!)');
      console.log(error.stdout || error.message);
    }
  }

  static async runComparisonDemo() {
    console.log('\n🎭 PARALLEL TESTING ARCHITECTURE COMPARISON');
    console.log('=============================================');
    console.log('Demonstrating the difference between bad and good patterns\n');
    
    // Run bad architecture first
    await this.runBadArchitectureDemo();
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Run good architecture
    await this.runGoodArchitectureDemo();
    
    console.log('\n📋 SUMMARY & KEY TAKEAWAYS');
    console.log('============================');
    console.log('❌ BAD Architecture Problems:');
    console.log('   • Global variables cause race conditions');
    console.log('   • Hardcoded data creates conflicts');
    console.log('   • Tests depend on each other');
    console.log('   • Unpredictable, flaky results');
    console.log('   • Doesn\'t scale with worker count\n');
    
    console.log('✅ GOOD Architecture Solutions:');
    console.log('   • Worker-specific data generation');
    console.log('   • Complete test isolation');
    console.log('   • Independent test execution');
    console.log('   • Predictable, reliable results');
    console.log('   • Scales to unlimited workers\n');
    
    console.log('🚀 NEXT STEPS:');
    console.log('   1. Always use TestDataFactory for unique data');
    console.log('   2. Never share state between tests');
    console.log('   3. Make tests completely independent');
    console.log('   4. Use worker-specific identifiers');
    console.log('   5. Test with multiple worker counts\n');
  }

  static async runPerformanceComparison() {
    console.log('\n⚡ PERFORMANCE COMPARISON');
    console.log('==========================');
    
    const workerCounts = [1, 2, 4, 8];
    const results = {};
    
    for (const workers of workerCounts) {
      console.log(`\nTesting with ${workers} worker(s)...`);
      
      try {
        const startTime = Date.now();
        
        execSync(
          `npx playwright test tests/examples/good-architecture/ --workers=${workers} --reporter=dot`,
          { 
            cwd: process.cwd(),
            encoding: 'utf8',
            stdio: 'pipe'
          }
        );
        
        const duration = Date.now() - startTime;
        results[workers] = duration;
        
        console.log(`✅ ${workers} worker(s): ${duration}ms`);
        
      } catch (error) {
        console.log(`❌ ${workers} worker(s): Failed`);
        results[workers] = 'Failed';
      }
    }
    
    console.log('\n📊 PERFORMANCE RESULTS:');
    console.log('------------------------');
    Object.entries(results).forEach(([workers, duration]) => {
      if (typeof duration === 'number') {
        const speedup = workers > 1 ? (results[1] / duration).toFixed(2) : '1.00';
        console.log(`${workers} worker(s): ${duration}ms (${speedup}x speedup)`);
      } else {
        console.log(`${workers} worker(s): ${duration}`);
      }
    });
  }
}

// CLI interface
const command = process.argv[2];

switch (command) {
  case 'bad':
    ArchitectureDemo.runBadArchitectureDemo();
    break;
  case 'good':
    ArchitectureDemo.runGoodArchitectureDemo();
    break;
  case 'comparison':
    ArchitectureDemo.runComparisonDemo();
    break;
  case 'performance':
    ArchitectureDemo.runPerformanceComparison();
    break;
  default:
    console.log('\n🎭 TestMart Parallel Architecture Demo');
    console.log('=====================================');
    console.log('Usage:');
    console.log('  node demo-runner.js bad         # Show failing parallel tests');
    console.log('  node demo-runner.js good        # Show working parallel tests');
    console.log('  node demo-runner.js comparison  # Run both and compare');
    console.log('  node demo-runner.js performance # Performance analysis');
    console.log('\nOr use npm scripts:');
    console.log('  npm run demo:bad-architecture');
    console.log('  npm run demo:good-architecture');
    console.log('  npm run demo:comparison');
    console.log('  npm run demo:performance\n');
}