import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedDistribution } from './feed-distribution';

describe('FeedDistribution', () => {
  let component: FeedDistribution;
  let fixture: ComponentFixture<FeedDistribution>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedDistribution]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeedDistribution);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
