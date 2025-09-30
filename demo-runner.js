#!/usr/bin/env node

/**
 * 🎭 TestMart Parallel Testing Demo Runner
 * 
 * This script demonstrates parallel testing with a shared database backend.
 * Shows both good practices (worker isolation) and bad practices (race conditions).
 * 
 * Usage:
 *   npm run demo:bad-architecture    # Show real database conflicts
 *   npm run demo:good-architecture   # Show proper worker isolation
 *   npm run demo:comparison          # Run both and compare results
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

class ArchitectureDemo {
  
  static async runBadArchitectureDemo() {
    console.log('\n🔥 RUNNING BAD ARCHITECTURE DEMO');
    console.log('=====================================');
    console.log('This demonstrates REAL database conflicts with shared data...\n');
    
    try {
      // Run bad architecture tests - these should fail with real conflicts
      const result = execSync(
        'npx playwright test tests/examples/bad-architecture/ --workers=4 --reporter=list',
        { 
          cwd: process.cwd(),
          encoding: 'utf8',
          stdio: 'pipe',
          timeout: 60000
        }
      );
      
      console.log('❌ UNEXPECTED: Bad tests passed (they should fail with conflicts!)');
      console.log(result);
      
    } catch (error) {
      console.log('✅ EXPECTED: Bad architecture tests failed with database conflicts!');
      console.log('🎯 Real issues demonstrated:');
      console.log('   - "User with email X already exists" (unique violations)');
      console.log('   - Race conditions on shared database');
      console.log('   - Unpredictable test results');
      console.log('   - Workers fighting over same data\n');
      
      // Show specific error patterns
      const errorOutput = error.stdout || error.stderr || error.message || '';
      if (errorOutput) {
        const lines = errorOutput.split('\n');
        console.log('📋 Sample Conflicts:');
        console.log('--------------------');
        lines.forEach((line) => {
          if (line.includes('already exists') || 
              line.includes('Error') || 
              line.includes('failed') ||
              line.includes('✘')) {
            console.log(`🔴 ${line.trim()}`);
          }
        });
      }
      
      console.log('\n🎯 This is why worker isolation is essential with shared databases!');
    }
  }

  static async runGoodArchitectureDemo() {
    console.log('\n✅ RUNNING GOOD ARCHITECTURE DEMO');
    console.log('=====================================');
    console.log('This demonstrates proper worker isolation with shared database...\n');
    
    try {
      // Run our real e2e tests with good architecture
      const result = execSync(
        'npx playwright test tests/e2e/ --workers=4 --reporter=list',
        { 
          cwd: process.cwd(),
          encoding: 'utf8',
          stdio: 'pipe',
          timeout: 60000
        }
      );
      
      console.log('✅ SUCCESS: All e2e tests passed with parallel execution!');
      console.log('🎯 Key patterns demonstrated:');
      console.log('   ✅ Worker-specific data via TestDataFactory');
      console.log('   ✅ Unique emails/users per worker');
      console.log('   ✅ Shared database without conflicts');
      console.log('   ✅ Reliable, predictable results');
      console.log('   ✅ Scales to any number of workers\n');
      
      // Show success metrics
      const lines = result.split('\n');
      const passedTests = lines.filter(line => line.includes('✓') || line.includes('passed'));
      console.log('📊 Test Results:');
      console.log('----------------');
      passedTests.slice(0, 15).forEach(line => {
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
    console.log('   • Hardcoded emails cause "already exists" errors');
    console.log('   • Workers compete for same database records');
    console.log('   • Race conditions on shared data');
    console.log('   • Unpredictable, flaky results');
    console.log('   • Can\'t scale with more workers\n');
    
    console.log('✅ GOOD Architecture Solutions:');
    console.log('   • TestDataFactory generates unique data per worker');
    console.log('   • Each worker has isolated test data');
    console.log('   • Shared database works safely');
    console.log('   • Predictable, reliable results');
    console.log('   • Scales to unlimited workers\n');
    
    console.log('🚀 IMPLEMENTATION:');
    console.log('   • Express API on :3001');
    console.log('   • Shared JSON database: database/shared-db.json');
    console.log('   • TestDataFactory: Worker-specific emails/users');
    console.log('   • 15 products with varying stock levels');
    console.log('   • Real conflicts demonstrated in bad-architecture tests\n');
  }

  static async runPerformanceComparison() {
    console.log('\n⚡ PERFORMANCE COMPARISON');
    console.log('==========================');
    console.log('Testing good architecture with different worker counts...\n');
    
    const workerCounts = [1, 2, 4];
    const results = {};
    
    for (const workers of workerCounts) {
      console.log(`Testing with ${workers} worker(s)...`);
      
      try {
        const startTime = Date.now();
        
        execSync(
          `npx playwright test tests/e2e/ --workers=${workers} --reporter=dot`,
          { 
            cwd: process.cwd(),
            encoding: 'utf8',
            stdio: 'pipe',
            timeout: 120000
          }
        );
        
        const duration = Date.now() - startTime;
        results[workers] = duration;
        
        console.log(`✅ ${workers} worker(s): ${(duration/1000).toFixed(1)}s`);
        
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
        console.log(`${workers} worker(s): ${(duration/1000).toFixed(1)}s (${speedup}x speedup)`);
      } else {
        console.log(`${workers} worker(s): ${duration}`);
      }
    });
    
    console.log('\n💡 Worker isolation allows safe parallel execution!');
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