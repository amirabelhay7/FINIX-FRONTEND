import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ContractsList } from './contracts-list';
import { Credit } from '../../../../services/credit/credit.service';
import { LoanContractsExplorerModule } from '../loan-contracts-explorer.module';

describe('ContractsList', () => {
  let component: ContractsList;
  let fixture: ComponentFixture<ContractsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanContractsExplorerModule],
      providers: [
        {
          provide: Credit,
          useValue: {
            getLoanContracts: () =>
              of({ content: [], totalElements: 0, totalPages: 0, size: 20, number: 0 }),
            getLoanContractDetails: () => of({}),
            downloadLoanContractPdf: () => of(new Blob()),
          },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContractsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
